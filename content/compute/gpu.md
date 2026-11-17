# GPU Flavors

Safespring Compute offers GPU-enabled flavors for workloads that require hardware-accelerated computing, such as machine learning inference, LLM hosting, and other GPU-intensive applications.

## Available GPU hardware

Safespring offers the following GPU models:

| Property     | NVIDIA A2                                       | NVIDIA H100 NVL                      |
| ------------ | ----------------------------------------------- | ------------------------------------ |
| GPU memory   | 16 GB GDDR6                                     | 94 GB HBM3                           |
| Architecture | Ampere                                          | Hopper                               |
| Site         | STO2                                            | STO1                                 |
| Use case     | Inference, lightweight training, video encoding | Inference with large language models |
| Availability | Available to all projects                       | On request                           |

## GPU flavor naming

GPU flavors follow the same naming convention as standard flavors, with an additional `gA2` suffix for NVIDIA A2. The following A2 flavors are available:

| Flavor name        | VCPUs | RAM   | Local disk | GPU          |
| ------------------ | ----- | ----- | ---------- | ------------ |
| `b2.c4r8.gA2`      | 4     | 8 GB  | -          | 1x NVIDIA A2 |
| `b2.c8r16.gA2`     | 8     | 16 GB | -          | 1x NVIDIA A2 |
| `l2.c4r16.125.gA2` | 4     | 16 GB | 125 GB     | 1x NVIDIA A2 |
| `l2.c8r32.250.gA2` | 8     | 32 GB | 250 GB     | 1x NVIDIA A2 |

A2 flavors are currently only available in STO2. Make sure you are logged in to the STO2 dashboard to see them.

To use NVIDIA H100 NVL, contact [support](../service/support.md).

## Restrictions

- GPU flavors **cannot** be converted to non-GPU flavors, and vice versa. See the [Flavors documentation](flavors.md) for more details on resizing restrictions.
- Each GPU flavor provides a single GPU passthrough to the instance. Multi-GPU configurations are not available through standard flavors.

## Set up a GPU instance

To create an A2 GPU instance, install the NVIDIA driver and run a local LLM, see [Set up an A2 GPU instance](howto/gpu-instance.md).

## GPU in Kubernetes

If you are using Safespring Kubernetes Engine, GPU support is available through worker nodes with GPU flavors. See the [Kubernetes GPU documentation](../kubernetes/gpu.md) for details on how to use GPUs in Kubernetes workloads.
