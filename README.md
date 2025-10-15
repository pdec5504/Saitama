# Saitama Workout App

Saitama is a full-stack web application designed to help users create, manage, and track their workout routines. It is built with a  microservices architecture, containerized with Docker, and ready for deployment on Kubernetes.

## Features

- User Authentication: Secure user registration and login using JWT.

- Routine Management: Create, read, update, delete, and reorder weekly workout routines.

- Exercise Management: Add, edit, delete, and reorder exercises within each routine.

- Dynamic Content: Fetches exercise GIFs from an external API.

- Asynchronous Processing: Uses a message queue (RabbitMQ) for background tasks, such as analyzing workout routines.

- Internationalization: Supports multiple languages (English and Portuguese).

## Architecture
The application is built on a microservices architecture to ensure scalability and separation of concerns. Communication between services is handled via REST APIs and a RabbitMQ message queue for asynchronous events.

## Services
- frontend: A React single-page application that serves as the user interface. It is served by an Nginx server which also acts as a reverse proxy to the backend services.

- auth-service: Handles user registration and authentication, issuing JWT tokens.

- routines-service: Manages CRUD operations for workout routines.

- exercises-service: Manages CRUD operations for exercises, fetches GIF data, and publishes events when exercises are added.

- analysis-service: A background worker that listens for events (e.g., new exercises) and performs analysis or processing.

- query-service: Provides a consolidated view of data, listening to events to build a denormalized data store for efficient querying by the frontend.

- mongodb: The primary database for storing user, routine, and exercise data.

- rabbitmq: The message broker used for asynchronous communication between services.

## Tech Stack
- Frontend: React, Vite, Axios, Framer Motion, i18next

- Backend: Node.js, Express.js

- Database: MongoDB

- Message Broker: RabbitMQ

- Containerization: Docker, Docker Compose

- Orchestration: Kubernetes (with Nginx Ingress)

## Getting Started
Follow these instructions to get the application running locally for development and testing.

### Prerequisites
- Node.js (v18 or higher)

- Docker

- Minikube (for Kubernetes deployment)

- kubectl (Kubernetes command-line tool)

### Environment Configuration
Before running the application, you need to set up your environment variables:

- Create a file named .env in the root of the project.

- Copy the contents of .env.example (if you have one) or use the template below and fill in your own secret values.

### .env file
- MONGO_USER=workout_admin
- MONGO_PASSWORD=YOUR_STRONG_PASSWORD
- MONGO_DB_NAME=workout
- MONGO_HOST=mongodb
- RABBITMQ_USER=workout_user
- RABBITMQ_PASSWORD=YOUR_STRONG_PASSWORD
- RABBITMQ_HOST=rabbitmq
- JWT_KEY=YOUR_SUPER_SECRET_JWT_KEY
- RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY
- RAPIDAPI_HOST=exercisedb.p.rapidapi.com

## Running with Docker Compose (for Development)
This is the recommended method for local development.

Start the application:
- Open a terminal in the project root and run: docker-compose up --build
- Access the application
- Once all containers are up and running, open your browser and navigate to: http://localhost
- To stop the application press Ctrl + C in the terminal where docker-compose is running.
- To remove the containers run: docker-compose down

## Running with Kubernetes (using Minikube)
This method simulates a production-like deployment on your local machine.

### Publish Docker Images:
Before deploying to Kubernetes, you need to build and push the images for each service to a container registry like Docker Hub.

Log in to your Docker Hub account:

- docker login
- For each of the 6 services (frontend and the 5 backend services), run the build and push commands, replacing your-dockerhub-username with your actual username:

#### Example for auth-service
- cd backend/auth
- docker build -t your-dockerhub-username/auth-service:latest .
- docker push your-dockerhub-username/auth-service:latest
- cd ../..
Important: After pushing the images, update all image: fields in the .yaml files inside the kubernetes/ directory to point to your Docker Hub images.

### Start the Kubernetes Cluster:
Open a terminal with Administrator privileges and start Minikube:

- minikube start
- minikube addons enable ingress
- Deploy the Application:
In a standard terminal, navigate to the project root and apply the Kubernetes manifests.

First, create the secret from your .env file:

- kubectl create secret generic saitama-secrets --from-env-file=.env

Apply all other resource definitions:
Ensure you've updated the image names in the YAML files first

- kubectl apply -f kubernetes/

Check if all pods are running:

- kubectl get pods
  
Wait until all pods show Running and 1/1 in the READY column.

### Access the Application:

Open a new terminal with Administrator privileges and start the network tunnel:

- minikube tunnel
  
Keep this terminal running in the background.

- Open your browser and navigate to: http://localhost (if you've set the host to localhost in 09-ingress.yaml)
