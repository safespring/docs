# Making use of GPU

In order to make use of GPU, one must add or already have worker nodes with [GPU flavors](../compute/flavors.md). Currently this means you can only use On-demand Kubernetes clusters in STO2 that have worker nodes with flavors that are suffixed with `gA2`.

Given that we use Talos Linux, we cannot make use of [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) and instead we install [NVIDIA device plugin for Kubernetes](https://github.com/NVIDIA/k8s-device-plugin).

!!! note "Supported Nvidia Drivers"
    Currently we only support Talos [Nvidia OSS drivers](https://docs.siderolabs.com/talos/v1.11/configure-your-talos-cluster/hardware-and-drivers/nvidia-gpu).

## Validate Nvidia Runtime available

To replicate the example make sure`kubeconf-demo` is [obtained](portal-overview.md#accessing-kubernetes-cluster) for that specific cluster and active in current shell via `KUBECONFIG` environment variable or specified via `--kubeconfig` flag for helm and kubectl command line tools.


```shell
➜ kubectl get runtimeclasses.node.k8s.io -A
NAME     HANDLER   AGE
nvidia   nvidia    5h42m
```

We can make use of [NVIDIA System Management Interface](https://docs.nvidia.com/deploy/nvidia-smi/index.html) to list current gpu capabilities, where the `nvcr.io/nvidia/cuda:12.9.1-base-ubuntu24.04` is available through [Nvidia Container registry](https://catalog.ngc.nvidia.com/search).

```shell
➜ kubectl run -n nvidia nvidia-test --restart=Never -ti --rm  --image nvcr.io/nvidia/cuda:12.9.1-base-ubuntu24.04 --overrides '{"spec": {"runtimeClassName": "nvidia"}}' nvidia-smi
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

## Example vLLM Deployment with DeepSeek

This example demonstrates deploying a [vLLM](https://docs.vllm.ai/) inference server running the [DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B) model.

### Prerequisites

Before deploying, you'll need a Hugging Face API token to download the model.
For this you need a Hugging Face user account. To download the model create a token with at least read permissions. See [HF security tokens](https://huggingface.co/docs/hub/en/security-tokens) for more details.

Create a Kubernetes secret with your token:

```shell
kubectl create secret generic hf-secret \
  --from-literal=hf_api_token='your_huggingface_token_here'
```

### Deploy vLLM with DeepSeek

```shell
➜ cat <<YAML | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-deepseek-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: deepseek-server
  template:
    metadata:
      labels:
        app: deepseek-server
    spec:
      runtimeClassName: nvidia
      containers:
        - name: inference-server
          image: docker.io/vllm/vllm-openai:v0.10.0
          resources:
            requests:
              cpu: "2"
              memory: "10Gi"
              ephemeral-storage: "10Gi"
              nvidia.com/gpu: "1"
            limits:
              cpu: "2"
              memory: "10Gi"
              ephemeral-storage: "10Gi"
              nvidia.com/gpu: "1"
          command: ["python3", "-m", "vllm.entrypoints.openai.api_server"]
          args:
            - --model=$(MODEL_ID)
            - --tensor-parallel-size=1
            - --host=0.0.0.0
            - --port=8000
          env:
            - name: LD_LIBRARY_PATH
              value: /usr/local/nvidia/lib64
            - name: MODEL_ID
              value: deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
            - name: HUGGING_FACE_HUB_TOKEN
              valueFrom:
                secretKeyRef:
                  name: hf-secret
                  key: hf_api_token
          volumeMounts:
            - mountPath: /dev/shm
              name: dshm
      volumes:
        - name: dshm
          emptyDir:
            medium: Memory
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
---
apiVersion: v1
kind: Service
metadata:
  name: llm-service
spec:
  selector:
    app: deepseek-server
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
YAML
```

### Verify the Deployment

Check that the deployment is running:

```shell
➜ kubectl get pods -l app=deepseek-server
NAME                                        READY   STATUS    RESTARTS   AGE
vllm-deepseek-deployment-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
```

Check the logs to ensure the model is loaded:

```shell
➜ kubectl logs -l app=deepseek-server --tail=50
```

### Test the Inference Server

Once the pod is running and the model is loaded, you can test the OpenAI-compatible API:

```shell
➜ kubectl run -it --rm curl-test --image=curlimages/curl --restart=Never -- \
  curl -X POST http://llm-service:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    "prompt": "Explain quantum computing in simple terms:",
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

Or test with a chat completion:

```shell
➜ kubectl run -it --rm curl-test --image=curlimages/curl --restart=Never -- \
  curl -X POST http://llm-service:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "max_tokens": 50
  }'
```

### Access from Outside the Cluster

To access the service from outside the cluster, you can use port-forwarding:

```shell
➜ kubectl port-forward service/llm-service 8000:8000
```

Then test from your local machine:

```shell
➜ curl -X POST http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    "prompt": "Hello, how are you?",
    "max_tokens": 50
  }'
```
