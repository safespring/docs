# Getting Started

## Where to Start

Kubernetes and OKD can have a bit of a learning curve when getting started. 

In addition to OKD-specific documentation available on this site, both OKD and Kubernetes have extensive documentation of their features.

- [Official OKD Documentation](https://docs.okd.io/)
- [Official Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Openshift cookbook](https://cookbook.openshift.org/)
- [Differences between Kubernetes and Openshift](https://www.ibm.com/think/topics/openshift-vs-kubernetes)

## Core Concepts

### Core Kubernetes Resources
   - **Pods:** The smallest deployable units in Kubernetes, which encapsulate one or more containers.
   - **Services:** Abstractions that define a logical set of Pods and a policy to access them, typically via a fixed IP and port.
   - **Deployments:** Resources that manage the deployment and scaling of Pods, ensuring the desired number of replicas are running.
   - **ReplicaSets:** Ensure that a specified number of Pod replicas are running at any given time.
   - **Namespaces:** Provide a mechanism to isolate groups of resources within a single cluster.
   - **ConfigMaps:** Store configuration data in key-value pairs, which can be consumed by Pods.
   - **Secrets:** Securely store sensitive information, such as passwords, tokens, or keys, that can be used by Pods.
   - **PersistentVolumes (PV) and PersistentVolumeClaims (PVC):** Provide and request storage resources in the cluster.
   - **NetworkPolicies:** Define rules for allowing or blocking traffic between Pods in the cluster.
   - **InitContainer:** is a container in a pod that is intended run to completion before the main containers are start
   - **Jobs:** Jobs represent one-off tasks that run to completion and then stop, whilst a **CronJob** is represents one-time **Jobs** on a repeating schedule.

### OpenShift-Specific Resources
   - **BuildConfigs:** Define how to build and deploy an application from source code to a running container image.
   - **ImageStreams:** Track changes to images, enabling versioning and automatic updates of Pods when a new image is available.
   - **Routes:** Provide external URLs for services, enabling external traffic to reach services inside the cluster.
   - **Projects:** Similar to Kubernetes namespaces but with additional features, such as resource quotas and role-based access control (RBAC).
   - **Templates:** Provide a mechanism to define a set of objects that can be instantiated together, often used to create complex applications.

In order to start using Container platform a user must have access to a namespace/project. Every Kubernetes object is created inside a `Namespace`. It is just a sandbox where all the other objects are contained and separated from objects belonging to other namespaces. In OKD they are referred as `Projects`. 

!!! important
    By default users are not permitted to create new projects. New projects can be created via upport@safespring.com or official European Open Science Cloud instructions.

    For more information on Projects and quotas see [Projects](projects.md) section.


## I just got access to Container Platform, what now?

In order to illustrate what can be achieved we will detail two scenarios:
- a simple scenario we will deploy an nginx application and illustrate what kind of configuration can be utilised in `YAML` format;
- creating job that will run at a given schedule and will display a message.

This configuration can be added via the Web Console using the `+` (plus) icon on the top navigation bar.

![Container Platform Add YAML](../images/cp-add-yaml.png)

Check you are on the desired project, above the `Import YAML` title there is the name of the project and a dropdown you can select the appropriate project. From the CLI you can select the right project either by running `oc project <project_name>` or ading `-n <project_name>` as an option to the `oc` command.

From the command line the `YAML` configuration can be saved as files and applied using `oc apply -f <file_path>` or specifying the project `oc apply -n <project_name> -f <file_path>`

### Deploy an Application

#### Creating a Deployment

Deployments manage rolling updates for an application. They typically contain a ReplicaSet and several pods. Another equivalent resource is a StatefulSet, that like a Deployment,  defines Pods based on container specification. But unlike a Deployment, a StatefulSet gives an expected and stable identity, with a persistent identifier that it is maintained across any event (upgrades, re-deployments, ...). A stateful set provides:

- Stable, unique network identifiers.
- Stable, persistent storage.
- Ordered, graceful deployment and scaling.
- Ordered, automated rolling updates.

In the example below we will utilize a deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  # number or replicas defines how many number of pods serve the application
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: docker.io/nginxinc/nginx-unprivileged
        ports:
        - containerPort: 8080
        # these resources are recommended in order to adhere to be concious of the
        # project limits and quotas
        resources:
          requests:
            cpu: 0.2
            memory: 0.5Gi
          limits:
            cpu: 0.2
            memory: 0.5Gi
```

#### Creating a Service

Services are built to export one or more ports, and they also provide an internal DNS name. Any of these names are valid and will resolve to the same internal service IP:

- `<service_name>`, e.g. `nginx`
- `<service_name>.<namespace>`, e.g. `nginx.eosc`
- `<service_name>.<namespace>.svc.cluster.local`, e.g. `nginx.eosc.svc.cluster.local`.

There a 2 essential steps to creating a service

1. Ensure your application has an exposed port, either during image configuration or by defining a port in the Kubernetes resource.

2. To make your application accessible, create a Service resource with a selector that matches the labels on your target pod(s). A single Service can route traffic to multiple pods and serve as a load balancer. Service names are resolvable via DNS, enabling other pods to connect to your application using the service name. You can also use NetworkPolicies to control communication between pods or projects, see more information about default restrictions in [Routes and Networking](networking.md#network-policies).


```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
```

In oder to skip creating the YAML you can expose the deployment via `oc` commands:
```bash
# oc expose deployment <deployment name>
oc expose deployment nginx

# check deployment
oc get deployment

# check service expose
oc get svc
```

#### Expose a Service to the Internet

For more information on the Routes and how to add certificates to them see [Routes and Networking](networking.md).

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: nginx
spec:
  to:
    kind: Service
    name: nginx
  port:
    targetPort: 8080
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
```

In oder to skip creating the YAML you can expose the service via `oc` commands:
```bash
# oc expose deployment <deployment name>
oc expose svc nginx

# check service expose
oc get routes

# check service expose
oc describe routes nginx
```

#### Add a Persistent Volume

For more information on persistent volumes, available storage classes and backup options check [Persistent Volumes](persistent-volume.md) section.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nginx-pvc
spec:
  resources:
    requests:
      storage: 1Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: fast
```

The deployment needs to be updated with the correct information to reflect the persistent volume.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: docker.io/nginxinc/nginx-unprivileged
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 0.2
            memory: 0.5Gi
          limits:
            cpu: 0.2
            memory: 0.5Gi
        volumeMounts:
        - mountPath: /mountdata
          name: smalldisk-vol # Refers to your volume below
  volumes:
  - name: smalldisk-vol
    persistentVolumeClaim:
      claimName: nginx-pvc # Refers to your PersistentVolumeClaim (pvc.yaml)
```

### Create a CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cronjob
spec:
  # schedule for the cronjob
  # https://crontab.guru/#5_4_*_*_sun
  schedule: "5 4 * * sun"
  jobTemplate:
    metadata:
     labels:
        cron-job-name: cronjob
    spec:
        template:
            metadata:
                labels:
                cron-job-name: cronjob
            spec:
                containers:
                - name: job
                    image: busybox:latest
                    command: ["/bin/sh", "-c", "echo 'Safespring Container Platform'"]
                restartPolicy: OnFailure

```