# Making use of GPU

In order to make use of GPU, one must add or already have worker nodes with [GPU flavors](../compute/flavors). Given that we use Talos Linux, we cannot make use of [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) and instead we install [NVIDIA device plugin for Kubernetes](https://github.com/NVIDIA/k8s-device-plugin).

## Example job

```bash
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
