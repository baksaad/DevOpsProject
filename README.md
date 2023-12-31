

# DevOps Project

# Introduction

Our application is a straightforward Node.js web API created to manage user settings, utilizing a Redis database. It provides essential CRUD (Create, Read, Update, Delete) functionalities for effective user management.


# 1. Instructions

## Setting Up and Running the Web Application

### Prerequisites

Ensure you have the following tools installed on your system:

- [Node.js](https://nodejs.org/en/download/)
- [Redis](https://redis.io/download/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```

2. Navigate to the `/userapi` folder:

   ```bash
   cd userapi/
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Running the Web Application

1. Start the web server from the `/userapi` directory:

   ```bash
   npm run start
   ```

2. Access the web application in your browser:

   [http://localhost:3000](http://localhost:3000)

### Creating a User

To create a user, send a POST request in the terminal:

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"username":"user","firstname":"First","lastname":"Last"}' \
  http://localhost:3000/user
```

You'll receive a response:

```json
{"status":"success","msg":"OK"}
```

## Running Tests

Before running tests, ensure the Redis server is running:

```bash
# Start Redis server
redis-server
```

Run tests from the root directory of the project:

```bash
npm run test
```


# 2. Implement CI/CD Pipeline

In our project, we have established a comprehensive CI/CD pipeline using GitHub Actions for continuous integration (CI) and Azure for continuous deployment (CD). This workflow automates the building, testing, and deployment processes for our Node.js application on Azure Web App.

## Continuous Integration (CI) with GitHub Actions

1. Create a `.github/workflows` folder at the project's root for GitHub Actions. The workflow is configured to run on every push, pull request to the main branch, and manually triggered workflow dispatch:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

2. Configure a Redis service as a container with health checks for testing purposes:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

    services:
      redis:
        image: "redis:latest"
        ports:
          - 6379:6379
        options: --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 3
```

3. Install dependencies and run tests:

```yaml
    steps:
      - uses: actions/checkout@v3
      - name: Change directory
        run: cd ./userapi
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: ./userapi/package-lock.json
      - run: npm test
        working-directory: ./userapi
        env:
          REDIS_HOST: localhost
          REDIS_PORT: 6379

```

4. Prepare for deployment by compressing the entire application source code into a ZIP archive and uploading it as an artifact:

```yaml
      - name: Zip artifact for deployment
        run: zip release.zip ./* -r

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v3
        with:
          name: node-app
          path: release.zip
```

The CI workflow checks the code, runs tests against a Redis container, and prepares the application for deployment by creating a ZIP artifact.


# Continuous Deployment (CD) with Azure

To achieve continuous deployment (CD) with Azure, we've set up the deployment configuration in our GitHub Actions workflow. The deployment process involves creating an Azure Web App, providing necessary configurations, and deploying our Node.js application.

## 1. Setup on Azure

After following the instructions in the lab 4 tutorial to create an application on Azure, proceed with configuring the deployment in the GitHub Actions file.

## 2. Create Azure Web App

Create an Azure Web App for your application. Below is a screenshot from Azure showcasing the created app:

![Azure Web App](screenshots/azure_web_app.png)

## 3. GitHub Actions Deployment Configuration

The deployment in GitHub Actions relies on the success of the build job artifact. After downloading and unpacking the artifact, deploy it to Azure Web App:

```yaml
      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'bakirballet'
          slot-name: 'production'
          publish-profile:${{secrets.AZUREAPPSERVICE_PUBLISHPROFILE_609A242D440D404FA1746EA32350AAEA}}
          package: ./userapi
```

In this workflow section, the application is deployed to Azure Web App. Key parameters, such as the application name, deployment slot name, the secret "AZUREAPPSERVICE_PUBLISHPROFILE" containing the publishing profile information required for secure deployment, and the path to the application package, are specified.

By triggering the CI/CD workflow on each push or pull request, we ensure the continuous integration and deployment of our application on Azure Web App.








# 3. Infrastructure as Code (IaC) Approach with Vagrant and Ansible

We have adopted the Infrastructure as Code (IaC) paradigm to streamline the configuration and provisioning of our virtual environment, ensuring consistency and reproducibility in setting up our development environment.

## Prerequisites

Before getting started, make sure you have the following tools installed:

- [Vagrant](https://www.vagrantup.com/)
- [VirtualBox](https://www.virtualbox.org/) (or another supported provider for Vagrant)
- [Ansible](https://www.ansible.com/)

## Configuration

### Vagrantfile

Our `Vagrantfile` specifies the configurations for our virtual machine (VM):

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "sloopstash/ubuntu-22-04"
  config.vm.box_version = "2.1.1"
  config.vm.define "sloopstash-ubuntu-22-04-server"
  config.vm.hostname = "sloopstash-ubuntu-22-04-server"
  config.vm.box_check_update = false
  config.vm.network "private_network", type: "dhcp"
  config.ssh.username = "vagrant"
  config.ssh.private_key_path = ["~/.vagrant.d/insecure_private_key"]
  config.ssh.insert_key = false

  config.vm.provider "vmware_fusion" do |vb|
    vb.gui = false
    vb.memory = "2048"
    vb.cpus = "1"
    vb.vmx["ethernet0.pcislotnumber"] = "160"
    vb.vmx["ethernet1.pcislotnumber"] = "224"
  end

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "./Playbooks/provision.yml"
  end
end
```

### Ansible Playbook (`provision.yml`)

Our Ansible playbook automates the provisioning of the VM, installing necessary components and configuring the environment:

```yaml
---
- hosts: all
  become: true

  tasks:
    - name: Clone and install application
      command: git clone https://baksaad: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@github.com/baksaad/Project_Ballet_Bakir.git
      args:
        chdir: "/home/vagrant/"

    - name: Update package cache
      apt:
        update_cache: yes

    - name: Install Node.js and npm
      become: true
      apt:
        name:
          - nodejs
          - npm
        state: present

    - name: Update package cache
      apt:
        update_cache: yes

    - name: Install libatomic1
      apt:
        name: "libatomic1"
        state: present
      environment:
        DEBIAN_FRONTEND: noninteractive
      when: "'22.04' in ansible_distribution_version or 'jammy' in ansible_distribution_version"

    - name: Install database (Redis)
      apt:
        name: "redis-server"
        state: present

    - name: Start Redis service
      systemd:
        name: redis-server
        state: started
        enabled: yes

    - name: Health check of your application
      command: npm run health_check
      args:
        chdir: "/home/vagrant/Project_Ballet_Bakir/userapi"

    - name: Install language runtime
      apt:
        name: "nodejs"
        state: present
      become: yes
```

## Usage

Follow these steps to set up and use your virtual environment:

1. **Start the VM:**

   ```bash
   vagrant up
   ```

2. **Provision the VM with Ansible:**

   ```bash
   vagrant provision
   ```

   This will execute the Ansible playbook and configure the VM with the specified components.

3. **Access the Application:**

   Once the VM is provisioned, visit http://localhost:3000 to access your application.

4. **Stop the VM:**

   When you're done, stop the VM:

   ```bash
   vagrant halt
   ```

This Infrastructure as Code approach with Vagrant and Ansible ensures an efficient and reproducible setup of your development environment.









# 4. Build Docker Image

We've containerized our application using Docker, providing an efficient way to run our application in a consistent environment. Below, we outline the steps to create a Docker image for your Node.js application.

## Dockerfile

We've created a `Dockerfile` that automates the process of building the Docker image. It defines the necessary steps to set up the application environment:

```dockerfile
# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "src/index.js" ]
```

## .dockerignore

We've also included a `.dockerignore` file to exclude unnecessary files and folders during the image creation process:

```plaintext
node_modules
npm-debug.log
```

## Installation

Follow these steps to build and use the Docker image:

1. **Install Docker Desktop:**

   Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

2. **Build the Docker Image:**

   Open a terminal and navigate to the `userapi` directory where the Dockerfile is located. Build the Docker image with the following command:

   ```bash
   docker build -t <username>/myapp:v1 .
   ```

   Note: Replace `<username>` with your Docker Hub username.

3. **Login to Docker:**

   ```bash
   docker login
   ```

4. **Push the Image to Docker Hub:**

   ```bash
   docker push <username>/myapp:v1
   ```

   Now you can see the image on Docker Hub.

   ![Docker Hub](link_to_dockerhub_image)

5. **Pull the Image (Optional):**

   ```bash
   docker pull <username>/myapp:v1
   ```

   Check if the image appears in your local Docker images:

   ```bash
   docker images
   ```

6. **Run the Container:**

   ```bash
   docker run -p 3000:3000 -d <username>/myapp:v1
   ```

   Check if the execution works:

   ```bash
   docker ps
   ```

   Visit http://localhost:3000/ to see the home page of the app.

   ![Hello World](link_to_hello_world_image)

7. **Stop the Container:**

   Finally, stop the container with the following command:

   ```bash
   docker stop <CONTAINER_ID>
   ```

This Docker image enables you to run your Node.js application in a self-contained and reproducible environment.







# 5. Container Orchestration using Docker Compose

To manage multiple containers and orchestrate the deployment of both our Node.js application and the Redis database, we utilize Docker Compose. This allows us to define, configure, and run multi-container Docker applications with ease.

## docker-compose.yml

Our `docker-compose.yml` file specifies two services:

- **App:** The primary service running our Node.js application based on the Dockerfile.

- **Redis:** A Redis database service using the official `redis:alpine` image.

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./src:/usr/src/app/src
      - ./conf:/usr/src/app/conf
    environment:
      - NODE_ENV=production
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
    depends_on:
      - redis

  redis:
    image: redis:alpine
    volumes:
      - ./data/redis:/data
    command: redis-server --appendonly yes --requirepass ""
```

## Usage

To start both the Redis application and the database, run the following command:

```bash
docker-compose up
```

This command launches and connects the containers defined in `docker-compose.yml`. Once the services are up and running, visit [http://localhost:3000](http://localhost:3000) to access our app's home page.

![App Home Page](link_to_app_home_page_image)

To stop and delete the containers, use the following command:

```bash
docker-compose down
```

This Docker Compose configuration streamlines the management of multiple containers, ensuring seamless deployment and interaction between our Node.js application and the Redis database.

# 6. Docker Orchestration with Kubernetes

We have orchestrated our Dockerized application using Kubernetes. Below are the steps to install a Kubernetes cluster using Minikube and the corresponding YAML files for Kubernetes Manifests.

## Install Minikube

Ensure you have Minikube installed to create a local Kubernetes cluster.

```bash
# Install Minikube
brew install minikube
```

## Kubernetes Manifest YAML Files

### Deployment (deployments.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ece-userapi-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ece-userapi
  template:
    metadata:
      labels:
        app: ece-userapi
        version: v1
    spec:
      containers:
      - name: ece-userapi-container
        image: baksaad/myapp:v1  
        ports:
        - containerPort: 3000
        env:
          - name: REDIS_HOST
            value: "ece-userapi-redis-service"
          - name: REDIS_PORT
            value: "6379"
```

### Persistent Volume (persistentvolume.yaml)

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: sample-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/data/pv-1"
```

### Persistent Volume Claim (persistentvolumeclaim.yaml)

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: sample-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### Service (services.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: sample-service
spec:
  selector:
    app: sample-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: NodePort
```

## Usage

1. **Start Minikube Cluster:**

   ```bash
   minikube start
   ```

2. **Apply Kubernetes Manifests:**

   ```bash
   kubectl apply -f deployments.yaml
   kubectl apply -f persistentvolume.yaml
   kubectl apply -f persistentvolumeclaim.yaml
   kubectl apply -f services.yaml
   ```

3. **Access the Application:**

   The service is exposed via a NodePort. Find the NodePort assigned:

   ```bash
   kubectl get services
   ```

   Visit `http://<minikube-ip>:<NodePort>` to access your application.

4. **Minikube Dashboard:**
   
 Minikube comes with a built-in dashboard that provides a graphical interface to manage and monitor your Kubernetes cluster. Here's how to enable and access the Minikube Dashboard:

### Enable Dashboard Add-On

```bash
minikube addons enable dashboard
```

### Access Dashboard

```bash
minikube dashboard
```

This command will open your default web browser with the Minikube Dashboard.

//INSERT IMAGE

Now, you have the Minikube Dashboard integrated into your Docker orchestration with Kubernetes using Minikube. This provides a visual representation of your cluster, its workloads, and various resources.

5. **Stop Minikube:**

   ```bash
   minikube stop
   ```

Now, your Dockerized application is orchestrated using Kubernetes with Minikube. Adjust the YAML files based on your specific configurations and requirements.

# 7. Implementing a Service Mesh with Istio

We've seamlessly integrated Istio into our Kubernetes cluster to establish a powerful service mesh for our application. Istio facilitates advanced traffic management, enabling precise control over routing and version deployments. Below, we provide the essential Istio configuration files along with explanations for each.

## Installation

Ensure Istio is installed in your Kubernetes cluster by following the [official Istio installation guide](https://istio.io/latest/docs/setup/getting-started/).

### Gateway Configuration (`Istio/istio-gateway.yaml`):

The Istio Gateway defines how external traffic enters the cluster. In our case, it exposes our application to external users.

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: ece-userapi-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
```

This configuration specifies an Istio Gateway named `ece-userapi-gateway` listening on port 80 for HTTP traffic.

### VirtualService Configuration (`Istio/istio-virtualservice.yaml`):

The Istio VirtualService defines how traffic is routed to different versions of our application.

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ece-userapi-virtualservice
  namespace: istio-system
spec:
  hosts:
  - "*"
  gateways:
  - istio-system/ece-userapi-gateway
  http:
  - route:
    - destination:
        host: ece-userapi
        subset: v1
      weight: 70
    - destination:
        host: ece-userapi
        subset: v2
      weight: 30
```

In this configuration, traffic is directed to two subsets (`v1` and `v2`) of our application. We allocate 70% of the traffic to `v1` and 30% to `v2`, demonstrating Istio's powerful traffic-shifting capabilities.

### Kiali Configuration (`Istio/kiali-cr.yaml` and `Istio/kiali.yaml`):

Kiali is an observability console for Istio, providing insights into the service mesh.

- `Istio/kiali-cr.yaml` defines Kiali's custom resource.
```yaml
apiVersion: kiali.io/v1alpha1
kind: Kiali
metadata:
  name: default
spec:
  deployment:
    inaccessibleNamespaces:
      - kube-system
  jaegerIntegration:
    deployment:
      inaccessibleNamespaces:
        - kube-system
  grafanaIntegration:
    deployment:
      inaccessibleNamespaces:
        - kube-system
  tracing:
    namespaceSelector: ''
  customDashboard:
    grafanaURL: ''
    k8s: false
  notification:
    slack:
      enabled: false
```

- `Istio/kiali.yaml` specifies the Gateway and VirtualService for Kiali.
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: kiali-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: kiali-vs
  namespace: istio-system
spec:
  hosts:
  - "*"
  gateways:
  - kiali-gateway
  http:
  - route:
    - destination:
        host: kiali
        port:
          number: 20001
```

## Usage

1. Apply Istio resources:

   ```bash
   kubectl apply -f Istio/istio-gateway.yaml
   kubectl apply -f Istio/istio-virtualservice.yaml
   kubectl apply -f Istio/kiali-cr.yaml
   kubectl apply -f Istio/kiali.yaml
   ```

2. Verify Istio component readiness:

   ```bash
   kubectl get pods -n istio-system
   ```

3. Access the Kiali dashboard:

   ```bash
   istioctl dashboard kiali
   ```

# Implementing Monitoring with Prometheus and Grafana

In this section, we'll guide you through the process of setting up monitoring for your containerized application using Prometheus and Grafana on your Kubernetes cluster.

## Step 1: Install Prometheus and Grafana using Helm

```bash
# Add Helm repositories for Prometheus and Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts

helm repo update

# Install Prometheus
helm install prometheus prometheus-community/prometheus

# Install Grafana
helm install grafana grafana/grafana
```

## Step 2: Configure Prometheus (prometheus-additional.yaml)

Create a configuration file (`prometheus-additional.yaml`) for additional Prometheus settings:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-additional-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s

    scrape_configs:
      - job_name: 'ece-userapi-job'
        static_configs:
          - targets: ['ece-userapi-service:3000']
```

Apply the configuration to your Prometheus deployment:

```bash
kubectl apply -f prometheus-additional.yaml
```

Access Prometheus UI:

To access the Prometheus UI, you need to port-forward to the Prometheus server:

```bash
kubectl port-forward -n prometheus svc/prometheus-server 9090:80
```

Open your browser and go to http://localhost:9090 to access the Prometheus UI.
## Step 3: Set Up Monitoring with Grafana

1. **Access Grafana Dashboard:**

   Get the Grafana pod name:

   ```bash
   kubectl get pods -n default -l "app.kubernetes.io/name=grafana" -o jsonpath="{.items[0].metadata.name}"
   ```

   Forward the Grafana port to localhost:

   ```bash
   kubectl port-forward -n default <grafana-pod-name> 3000:3000
   ```

   Visit http://localhost:3000 and log in with your  credentials (admin/yourpassword).

   You can find your password using this command :
   ```bash
   kubectl get secret --namespace grafana grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
   ```

3. **Link Grafana to Prometheus:**

   - Add Prometheus as a data source in Grafana using the Prometheus server URL: 

   - Create a dashboard and set up queries to display monitored application metrics.

4. **Create Alerts in Grafana:**

   - Navigate to the dashboard settings in Grafana.
   - Add a new notification channel linked to Prometheus.
   - Set up alert conditions (e.g., based on application status).
   - Trigger the alerts by intentionally shutting down your application pods.

Now, you have Prometheus monitoring your application's status, and Grafana is visualizing the metrics. Create alerts in Grafana based on your specific application metrics and requirements.

