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
