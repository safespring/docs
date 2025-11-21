# Cluster Authentication

We recommend leveraging the [kubectl OIDC plugin](https://github.com/int128/kubelogin) (`kubelogin`) for handling OIDC-based logins seamlessly from the command line by installing it in your environment.

!!! note "Accessing Kubernetes Cluster"
    We recommend making use of [portal generated Kubeconfig](portal-overview.md#accessing-kubernetes-cluster) for generating an up to date `.kubeconfig`.
