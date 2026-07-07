# Downloaded kubernetes from websitee, executed below line in terminal
#Download the latest release:
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/arm64/kubectl"

#Validate the binary (optional), Download the kubectl checksum file:
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/arm64/kubectl.sha256"

# Validate the kubectl binary against the checksum file:
echo "$(cat kubectl.sha256)  kubectl" | shasum -a 256 --check

#If valid, the output is:
kubectl: OK

# Make the kubectl binary executable.
chmod +x ./kubectl

# Move the kubectl binary to a file location on your system PATH.
sudo mv ./kubectl /usr/local/bin/kubectl
sudo chown root: /usr/local/bin/kubectl

# Test to ensure the version you installed is up-to-date:
kubectl version --client or kubectl version --client --output=yaml

# After installing and validating kubectl, delete the checksum file:
rm kubectl.sha256

# Run the installation command:
brew install kubectl
or
brew install kubernetes-cli


Kubectl has no cluster to talk to — no context is configured. Here's how to fix it depending on what you're using:

Option A — Docker Desktop's built-in Kubernetes (easiest on Mac)

Open Docker Desktop.
Go to Settings → Kubernetes.
Check "Enable Kubernetes" and click Apply & Restart.
Wait for the green "Kubernetes running" status in the bottom-left.
Then run:
kubectl config use-context docker-desktop

# Now we can apply the file
kubectl apply -f simple-pod.yaml

# Get the running pods
kubectl get pods

# Desribe the pod
kubectl describe pod nginx

# Delete resources(pod)
kubectl delete -f simple-pod.yaml
or
kubectl delete pod nginx

# get namespace
kubectl get namespace

# create namespace
kubectl create ns demo

# create pod agian
kubectl apply -f simple-pod-ns.yaml

# list pods for namespace
kubectl get pod -n demo