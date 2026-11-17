# Set up an A2 GPU instance

This guide shows how to create a Compute instance with an NVIDIA A2 GPU, install the NVIDIA driver, and check that the GPU works. At the end, there is an optional example of running a local language model (LLM).

!!! note
    This guide covers NVIDIA A2 only. There is no setup guide for NVIDIA H100 NVL yet. See [GPU Flavors](../gpu.md) for all available GPUs.

The examples use Ubuntu 24.04. Other operating systems also work, but the driver installation differs. See [NVIDIA's driver installation guide](https://docs.nvidia.com/datacenter/tesla/driver-installation-guide/) for other distributions.

## Before you start

You need:

- access to a Safespring Compute project in **STO2**, where A2 flavors are currently available
- an SSH key pair imported into the dashboard
- a security group that allows SSH (port 22)

If you have not created an SSH key pair or a security group before, follow the [Preparations](../getting-started.md#preparations) section of Getting Started first.

## 1. Launch a GPU instance

Follow [Launch your first instance](../getting-started.md#launch-your-first-instance) in Getting Started, with these choices:

- **Dashboard:** log in to the STO2 dashboard. A2 flavors are not shown at other sites.
- **Source:** choose the image `Ubuntu 24.04` to follow this guide exactly.
- **Flavor:** choose a flavor ending in `gA2`, for example `b2.c4r8.gA2`. See [GPU Flavors](../gpu.md#gpu-flavor-naming) for all A2 flavors.
- **Networks:** choose **public**, so that you can connect with SSH.

!!! warning "b2 or l2?"
    Flavors starting with **l2** use local disk. The disk is deleted together with the instance and cannot be recovered. If you are unsure, choose a **b2** flavor and a volume-backed boot disk as described in Getting Started.

When the instance has status **Running**, connect to it:

```shell
ssh ubuntu@<ip-address>
```

## 2. Install the NVIDIA driver

The instance has a GPU, but Ubuntu needs a driver to use it.

Update the system and install the tool that finds the right driver:

```shell
sudo apt update && sudo apt upgrade -y
sudo apt install ubuntu-drivers-common
```

List the available drivers:

```shell
ubuntu-drivers devices
```

The output shows several drivers. Look for the one marked **recommended**, and choose the version ending in `-server-open`. Install it, for example:

```shell
sudo apt install nvidia-driver-580-server-open
sudo reboot
```

Replace `580` with the version recommended for your instance. The reboot closes your SSH connection. Wait a minute and connect again.

## 3. Verify the GPU

Check that the GPU is detected:

```shell
nvidia-smi
```

The output should show **NVIDIA A2**, the driver version and the CUDA version. The version numbers in your output may differ from this example:

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

If you see this, the instance is ready for GPU workloads.

## 4. Optional: run a local LLM with Ollama

A common use case for A2 instances is running language models locally. This example uses [Ollama](https://ollama.com/) to run a model and [Open-WebUI](https://github.com/open-webui/open-webui) for a chat interface in the browser.

### Install Ollama

```shell
curl -fsSL https://ollama.com/install.sh | sh
ollama -v
```

### Download and run a model

```shell
ollama pull llama3:8b
ollama run llama3:8b
```

To see that the model uses the GPU, run `nvidia-smi` in a second SSH session while the model is running.

### Access Ollama from your computer

Ollama only listens on the instance itself (`localhost:11434`). To reach it from your computer, connect with SSH port forwarding:

```shell
ssh -L 11434:localhost:11434 ubuntu@<ip-address>
```

### Add a chat interface with Open-WebUI

Install Docker on the instance:

```shell
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and connect again, this time forwarding port 8080 for the web interface:

```shell
ssh -L 8080:localhost:8080 ubuntu@<ip-address>
```

Start Open-WebUI:

```shell
docker run -d \
  --name open-webui \
  --network=host \
  -e OLLAMA_BASE_URL=http://127.0.0.1:11434 \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:latest
```

Open `http://localhost:8080` in your browser. All processing happens on your instance.
