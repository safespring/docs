# GPU Flavors

Safespring Compute offers GPU-enabled flavors for workloads that require hardware-accelerated computing, such as machine learning inference, LLM hosting, and other GPU-intensive applications.

This page includes OpenStack CLI commands. See the [API Access documentation](api.md) for instructions on how to install and configure the command line client.

## Available GPU hardware

GPU flavors on Safespring are equipped with the **NVIDIA A2** accelerator:

| Property | Specification |
| --- | --- |
| GPU model | NVIDIA A2 |
| GPU memory | 16 GB GDDR6 |
| Architecture | Ampere |
| Use case | Inference, lightweight training, video encoding |

## GPU flavor naming

GPU flavors follow the same naming convention as standard flavors, with an additional `gA2` suffix indicating the attached GPU. For example:

| Flavor name | VCPUs | RAM | GPU |
| --- | --- | --- | --- |
| `b2.c4r8.gA2` | 4 | 8 GB | 1x NVIDIA A2 |

!!! info "Availability"
    GPU flavors are currently available in the **STO2** site. Contact [support](../service/support.md) to verify availability and to get GPU flavors enabled for your project.

## Restrictions

- GPU flavors **cannot** be converted to non-GPU flavors, and vice versa. See the [Flavors documentation](flavors.md) for more details on resizing restrictions.
- Each GPU flavor provides a single GPU passthrough to the instance. Multi-GPU configurations are not available through standard flavors.

## Setting up NVIDIA drivers on an instance

GPU flavors provide the hardware, but the instance operating system needs NVIDIA drivers installed to use the GPU. The following example uses Ubuntu 24.04.

### 1. Install the driver

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install ubuntu-drivers-common
```

List available drivers to find the recommended version:

```bash
ubuntu-drivers devices
```

Install the recommended server driver:

```bash
sudo apt install nvidia-driver-580-server-open
sudo reboot
```

### 2. Verify the GPU

After reboot, verify that the GPU is detected:

```bash
nvidia-smi
```

This should display the NVIDIA A2 GPU, the driver version, and CUDA version. Example output:

```
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 570.172.08             Driver Version: 570.172.08     CUDA Version: 12.9     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|=========================================+========================+======================|
|   0  NVIDIA A2                      On  |   00000000:00:05.0 Off |                    0 |
|  0%   35C    P8              5W /   60W |       0MiB /  15356MiB |      0%      Default |
+-----------------------------------------+------------------------+----------------------+
```

## Example: Running a local LLM with Ollama

A common use case for GPU flavors is hosting local LLMs for inference. The following example uses [Ollama](https://ollama.com/) to run models and [Open-WebUI](https://github.com/open-webui/open-webui) to provide a browser-based chat interface.

### Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama -v
```

### Pull and run a model

```bash
ollama pull llama3:8b
ollama run llama3:8b
```

You can monitor GPU utilization while the model is running:

```bash
nvidia-smi
```

### Access Ollama remotely via SSH forwarding

Ollama listens on `localhost:11434`. To access it from your local machine, use SSH port forwarding:

```bash
ssh -L 11434:localhost:11434 ubuntu@<instance-ip>
```

### Add a web interface with Open-WebUI

Install Docker on the instance:

```bash
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and back in (with port forwarding for the web interface):

```bash
ssh -L 8080:localhost:8080 ubuntu@<instance-ip>
```

Start Open-WebUI:

```bash
docker run -d \
  --name open-webui \
  --network=host \
  -e OLLAMA_BASE_URL=http://127.0.0.1:11434 \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:latest
```

Open `http://localhost:8080` in your browser to access the chat interface. All processing happens locally on your instance.

## GPU in Kubernetes

If you are using Safespring's On-demand Kubernetes service, GPU support is available through worker nodes with GPU flavors. See the [Kubernetes GPU documentation](../kubernetes/gpu.md) for details on how to use GPUs in Kubernetes workloads.
