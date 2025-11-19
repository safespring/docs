# Making use of GPU

In order to make use of GPU, one must add or already have worker nodes with [GPU flavors](../compute/flavors.md). Given that we use Talos Linux, we cannot make use of [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) and instead we install [NVIDIA device plugin for Kubernetes](https://github.com/NVIDIA/k8s-device-plugin).

!!! note "Supported Nvidia Drivers"
    Currently we only support Talos [Nvidia OSS drivers](https://docs.siderolabs.com/talos/v1.11/configure-your-talos-cluster/hardware-and-drivers/nvidia-gpu).

## Validate Nvidia Runtime available

To replicate the example make sure`kubeconf-demo` is [obtained](portal-overview.md#accessing-kubernetes-cluster) for that specific cluster

```shell
➜ kubectl --kubeconfig=kubeconf-demo get runtimeclasses.node.k8s.io -A
NAME     HANDLER   AGE
nvidia   nvidia    5h42m
```

We can make use of [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) to list current gpu capabilities, where the `nvcr.io/nvidia/cuda:12.9.1-base-ubuntu24.04` is available through [Nvidia Container registry](https://catalog.ngc.nvidia.com/search).

```shell
➜ kubectl --kubeconfig=kubeconf-demo run -n nvidia nvidia-test --restart=Never -ti --rm  --image nvcr.io/nvidia/cuda:12.9.1-base-ubuntu24.04 --overrides '{"spec": {"runtimeClassName": "nvidia"}}' nvidia-smi 
Tue Nov 18 16:12:48 2025       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 570.172.08             Driver Version: 570.172.08     CUDA Version: 12.9     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA A2                      On  |   00000000:00:05.0 Off |                    0 |
|  0%   35C    P8              5W /   60W |       0MiB /  15356MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
                                                                                         
+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
pod "nvidia-test" deleted
```

## Example job

```shell
➜ cat <<EOF | kubectl --kubeconfig=kubeconf-demo apply -f -   
apiVersion: v1                
kind: Pod          
metadata:
  name: gpu-pod         
  namespace: nvidia
spec:  
  restartPolicy: Never             
  runtimeClassName: nvidia
  containers:               
    - name: cuda-container                                
      image: nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda12.5.0
      resources:
        limits: 
          nvidia.com/gpu: 1 # requesting 1 GPU
  tolerations:    
  - key: nvidia.com/gpu
    operator: Exists      
    effect: NoSchedule
EOF
```

The result of the above pod would be:

```shell
➜ kubectl --kubeconfig=kubeconf-demo get pods -n nvidia gpu-pod 
NAME      READY   STATUS      RESTARTS   AGE
gpu-pod   0/1     Completed   0          19s
```

with the output looking like:

```shell
➜ kubectl --kubeconfig=kubeconf-demo logs -f -n nvidia gpu-pod 
[Vector addition of 50000 elements]
Copy input data from the host memory to the CUDA device
CUDA kernel launch with 196 blocks of 256 threads
Copy output data from the CUDA device to the host memory
Test PASSED
Done
```

## Example Tensorflow Training

Let us start by creating a python script `tensor_test.py` that makes use of [Tensorflow](https://www.tensorflow.org/) for training.

Once the `tensor_test.py` file has been created with the content below we will add it as [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/) `kubectl --kubeconfig=kubeconf-demo create configmap tensor -n test --from-file=tensor_test.py`

```python
import os
import tensorflow as tf
import time

# Limit TensorFlow to use only one GPU
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        # Specify the GPU you want to use (e.g., gpus[0] for the first GPU)
        tf.config.set_visible_devices(gpus[0], 'GPU')
        tf.config.experimental.set_memory_growth(gpus[0], True)
    except RuntimeError as e:
        print(e)
else:
    print("No GPUs found.")

# Create a ResNet50 model
model = tf.keras.applications.ResNet50(
    weights=None,
    input_shape=(224, 224, 3),
    classes=1000
)

# Compile the model
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Generate synthetic data
batch_size = 64
num_batches = 100
input_shape = (batch_size, 224, 224, 3)
steps_per_epoch = num_batches

# Create a dataset with synthetic data
def generate_synthetic_data():
    while True:
        x = tf.random.uniform(input_shape)
        y = tf.random.uniform((batch_size,), maxval=1000, dtype=tf.int32)
        yield x, y

dataset = tf.data.Dataset.from_generator(
    generate_synthetic_data,
    output_types=(tf.float32, tf.int32),
    output_shapes=(input_shape, (batch_size,))
).prefetch(tf.data.AUTOTUNE)

# Custom callback to record batch times
class TimeHistory(tf.keras.callbacks.Callback):
    def on_train_begin(self, logs=None):
        self.batch_times = []
        self.epoch_start = time.time()

    def on_batch_begin(self, batch, logs=None):
        self.batch_start = time.time()

    def on_batch_end(self, batch, logs=None):
        batch_time = time.time() - self.batch_start
        self.batch_times.append(batch_time)

    def on_epoch_end(self, epoch, logs=None):
        total_time = time.time() - self.epoch_start
        avg_batch_time = sum(self.batch_times) / len(self.batch_times)
        throughput = batch_size / avg_batch_time
        print(f"\nAverage Step Time: {avg_batch_time:.4f} seconds")
        print(f"Throughput: {throughput:.2f} images/second")
        print(f"Total Training Time: {total_time:.2f} seconds")

# Instantiate the callback
time_callback = TimeHistory()

# Train the model
model.fit(
    dataset,
    epochs=1,
    steps_per_epoch=steps_per_epoch,
    callbacks=[time_callback],
    verbose=1
) 
```

The next step involves creating a pod with the tensorflow image and installing the correct package namely `tensorflow[and-cuda]==2.15.1` so that GPU can be recognized.

```shell
➜ cat <<EOF | kubectl --kubeconfig=kubeconf-demo apply -f -   
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod-example
  namespace: test
spec:
  containers:
  - name: gpu-container
    image: docker.io/tensorflow/tensorflow:latest-gpu
    command: ["sleep", "infinity"]
    resources:
        limits:
            nvidia.com/gpu: 1
    volumeMounts:
      - name: tensor
        mountPath: /scripts
  serviceAccount: default
  runtimeClassName: nvidia
  tolerations:
  - key: nvidia.com/gpu
    operator: Exists
    effect: NoSchedule
  volumes:
    - name: tensor
      configMap:
        name: tensor
        defaultMode: 420
EOF
```

Enter the pod `kubectl --kubeconfig=kubeconf-demo -n test exec --stdin --tty pods/gpu-pod-example -- /bin/bash` and run the necessary commands to install packages, check the GPU is recognize and start the training.

```shell
root@gpu-pod-example:/# pip3 install tensorflow[and-cuda]==2.15.1
....
root@gpu-pod-example:/# python3 -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
....
[PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
root@gpu-pod-example:/# python3 /scripts/tensor_test.py 2>/dev/null
100/100 [==============================] - ETA: 0s - loss: 7.9015 - accuracy: 4.6875e-04     
Average Step Time: 1.2005 seconds
Throughput: 53.31 images/second
Total Training Time: 120.16 seconds
100/100 [==============================] - 120s 723ms/step - loss: 7.9015 - accuracy: 4.6875e-04

```