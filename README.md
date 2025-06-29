# examples-crolang-p2p-authentication-extension
Repository containing an example authentication extension for the [CrolangP2P Broker](https://github.com/crolang-p2p/crolang-p2p-broker) in the [CrolangP2P project](https://github.com/crolang-p2p).

## Table of contents
- [The CrolangP2P Project](#the-crolangp2p-project)
- [What is an Authentication Extension](#what-is-an-authentication-extension)
- [How this Example Works](#how-this-example-works)
- [Authentication Logic](#authentication-logic)
- [Running the Authentication Extension](#running-the-authentication-extension)
  - [Standalone](#standalone)
  - [With Docker](#with-docker)
  - [With the Example 12 Setup](#with-the-example-12-setup)
- [Integration with the Broker](#integration-with-the-broker)
- [API Endpoint](#api-endpoint)
- [Contributing](#contributing)
- [License](#license)

## The CrolangP2P Project
[CrolangP2P](https://github.com/crolang-p2p) is a simple, robust framework for cross-language peer-to-peer (P2P) connections. 
Clients ("Crolang Nodes") libraries can be easily integrated into your project and connect using only the ID of the target node, 
exchanging messages directly via P2P or via WebSocket using the [Crolang Broker](https://github.com/crolang-p2p/crolang-p2p-broker) as relay. 
The framework manages the connection and you can focus on what matters most: your project's logic.

- **Simplicity:** Minimal setup—just import the Node library, specify the peer ID, and connect.
- **Cross-language:** [Multiple Node implementations](https://github.com/crolang-p2p#available-crolangp2p-node-implementations) allow seamless P2P between different languages.
- **No packet size limits:** Large data exchange is supported.
- **Extensible:** The Broker supports modular extensions for authentication, authorization, message handling, and more.

Nodes connect through the [Crolang Broker](https://github.com/crolang-p2p/crolang-p2p-broker), which acts as a rendezvous point: 
it helps nodes discover each other and establish direct WebRTC connections.

## What is an Authentication Extension
The [CrolangP2P Broker](https://github.com/crolang-p2p/crolang-p2p-broker) supports a modular extension system that allows you to customize its behavior. 
One of the most important extensions is **node authentication**, which lets you control which nodes can connect to your broker.

By default, the Broker allows any node to connect without authentication. However, in production environments, you typically want to:
- Verify node credentials before allowing connections
- Implement custom authentication logic (API keys, JWT tokens, database lookups, etc.)
- Control access based on business rules
- Log authentication attempts for security auditing

This repository provides a **simple example** of how to implement a webhook-based authentication extension that the Broker can call to validate node connection attempts.

## How this Example Works
This authentication extension is a simple Express.js server that:

1. **Receives authentication requests** from the Broker via HTTP POST to `/authenticate-node`
2. **Parses authentication data** sent by the connecting node (expects JSON with `password` and `token` fields)
3. **Validates credentials** using hardcoded values (for demonstration purposes)
4. **Returns authentication result** as JSON response to the Broker

**Important**: This is a **demonstration example** with hardcoded credentials. In a real-world scenario, you would implement proper credential validation using databases, external APIs, JWT verification, etc.

## Authentication Logic
The example server implements a very basic authentication check:

```javascript
// Accepts only nodes with:
// - Node ID: "Alice"
// - Password: "unicorns" 
// - Token: "magic-token"
res.json({ 
  authenticated: id === "Alice" && password === "unicorns" && token === "magic-token" 
});
```

**Input format expected** (sent by the node as authentication data):
```json
{
  "password": "unicorns",
  "token": "magic-token"
}
```

**Response format** (returned to the Broker):
```json
{
  "authenticated": true
}
```

## Running the Authentication Extension

### Standalone
To run the authentication extension server locally:

```bash
# Install dependencies
npm install

# Start the server (default port: 8081)
npm start

# Or specify a custom port
PORT=3000 npm start
```

The server will be available at `http://localhost:8081` (or your specified port).

### With Docker
You can run the authentication extension using Docker:

```bash
# Build the Docker image
docker build -t crolang-auth-extension .

# Run the container
docker run -p 8081:8081 crolang-auth-extension
```

### With the Example 12 Setup
This authentication extension is specifically designed to work with **Example 12** from the CrolangP2P Node libraries:

- **Java Example**: [examples-java-crolang-p2p-node-jvm/ex_12](https://github.com/crolang-p2p/examples-java-crolang-p2p-node-jvm/tree/main/src/main/java/examples/ex_12)
- **Kotlin Example**: [examples-kotlin-crolang-p2p-node-jvm/ex_12](https://github.com/crolang-p2p/examples-kotlin-crolang-p2p-node-jvm/tree/main/src/main/kotlin/ex_12)

Both examples include a `docker-compose.yml` file that automatically starts:
1. The CrolangP2P Broker configured to use this authentication extension
2. This authentication extension server
3. The proper networking between services

To run the complete setup:

```bash
# Navigate to the Example 12 directory (Java or Kotlin)
cd examples-java-crolang-p2p-node-jvm/src/main/java/examples/ex_12
# OR
cd examples-kotlin-crolang-p2p-node-jvm/src/main/kotlin/ex_12

# Start the services
docker-compose up

# Run the example node (in another terminal)
# For Java:
./gradlew run -PmainClass=examples.ex_12.Ex_12_Alice
# For Kotlin:
./gradlew run -PmainClass=ex_12.Ex_12_AliceKt
```

## Integration with the Broker
To configure the CrolangP2P Broker to use this authentication extension, set the following environment variable:

```bash
NODES_AUTHENTICATION_WEBHOOK_URL=http://localhost:8081/authenticate-node
```

Or in Docker Compose:

```yaml
services:
  broker:
    image: crolangp2p/broker:latest
    environment:
      - NODES_AUTHENTICATION_WEBHOOK_URL=http://auth-extension:8081/authenticate-node
  
  auth-extension:
    image: crolangp2p/examples-crolang-p2p-authentication-extension:latest
    ports:
      - "8081:8081"
```

When a node attempts to connect, the Broker will:
1. Receive the connection request with authentication data
2. Forward the request to your authentication extension
3. Allow or deny the connection based on your extension's response

## API Endpoint

### POST `/authenticate-node`

**Description**: Validates node authentication credentials.

**Request Body**:
```json
{
  "id": "Alice",
  "data": "{\"password\":\"unicorns\",\"token\":\"magic-token\"}"
}
```

**Response**:
```json
{
  "authenticated": true
}
```

**Parameters**:
- `id` (string): The ID of the node attempting to connect
- `data` (string|object): Authentication data sent by the node (can be a JSON string or object)

**Response Fields**:
- `authenticated` (boolean): Whether the node should be allowed to connect

## Contributing
This is a simple example for demonstration purposes. For production use, consider implementing:

- **Database integration** for credential storage
- **JWT token validation**
- **Rate limiting** for authentication attempts
- **Proper error handling** and logging
- **HTTPS/TLS** for secure communication
- **Input validation** and sanitization
- **Configurable authentication rules**

Contributions, bug reports, and feature requests are welcome! Please open an issue or pull request on GitHub.

## License
This project is licensed under the Apache-2.0 License - see the LICENSE file for details.