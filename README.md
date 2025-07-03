# Service Bus Emulator Inspector

A modern web-based tool for exploring and managing Azure Service Bus instances, with a focus on local development workflows using the Azure Service Bus Emulator.

## Overview

SBEmu Inspector provides a clean interface for developers working with Azure Service Bus during local development. Built specifically with the Service Bus Emulator in mind, eliminating the need for cloud resources during development and testing phases.

## Installation

### Using the Published Image

```bash
docker run -d -p 8080:8080 ghcr.io/yourusername/tools-sbemu-inspector:latest
```

Access the application at http://localhost:8080

### Building Locally

```bash
# Clone and build
git clone https://github.com/yourusername/tools-sbemu-inspector.git
cd tools-sbemu-inspector
docker build -f docker/Dockerfile -t sbemu-inspector:dev .

# Run your local build
docker run -d -p 8080:8080 sbemu-inspector:dev
```

## Getting Started

1. Start the SBEmu Inspector container
2. Open your browser to http://localhost:8080
3. Enter your Service Bus connection string
4. Start exploring your queues and topics

## Configuration Guide

### Connecting to Service Bus Emulator

The connection string format depends on where your Service Bus Emulator is running:

**Local Development (Most Common)**
- Emulator on your machine: Use `localhost`
- Inspector in Docker, Emulator on host: Use `host.docker.internal`
- Both in Docker: Use the emulator's container name

**Connection String Format**
```
Endpoint=sb://[HOSTNAME]:[PORT];SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true
```

Common configurations:
- Default local: `sb://localhost`
- From container: `sb://host.docker.internal`  
- Docker-to-Docker: `sb://your-emulator-container-name`
- Custom port: `sb://localhost:5672`

### Network Setup for Containers

If running multiple services in containers:

```bash
# Create a shared network
docker network create dev-network

# Run services on the same network
docker run -d --network dev-network --name sbe servicebusemulator:latest
docker run -d --network dev-network -p 8080:8080 sbemu-inspector:latest
```

Then connect using: `sb://sbe` in your connection string.

## Features

- **Queue Management**: View, send, and receive messages
- **Topic Explorer**: Browse topics and subscriptions
- **Message Inspector**: Examine message properties and content
- **Dead Letter Handling**: Manage and resubmit failed messages
- **Session Support**: Work with session-enabled entities
- **Real-time Updates**: Auto-refresh message counts

## Development

### Tech Stack
- Frontend: React with TypeScript
- Backend: .NET 9.0 Web API
- Infrastructure: Nginx + Supervisord in Alpine Linux

### Local Development Setup

```bash
# Use the development compose file
docker-compose -f docker-compose.dev.yml up --build
```

### Project Structure
```
tools-sbemu-inspector/
├── frontend/          # React application
├── backend/           # .NET API
├── docker/            # Docker configuration
└── docker-compose.dev.yml
```

## Troubleshooting

**Cannot connect to Service Bus Emulator**
- Verify the emulator is running: `docker ps`
- Check your connection string hostname
- Ensure ports aren't blocked by firewall

**Container networking issues**
- Use `docker network ls` to verify networks
- Ensure containers are on the same network
- Try `host.docker.internal` for host access

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by Norad</sub>
</div>