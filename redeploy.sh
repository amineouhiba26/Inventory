#!/bin/bash
echo "Waiting for Kubernetes to be ready..."
kubectl wait --for=condition=Ready node --all --timeout=60s

echo "Cleaning up old resources..."
kubectl delete -f k8s-manifests/ --ignore-not-found=true

echo "Waiting for ports to be released..."
sleep 5

echo "Deploying new resources..."
kubectl apply -f k8s-manifests/

echo "Checking status..."
kubectl get pods,svc
