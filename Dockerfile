FROM codercom/code-server:latest

# Install dependencies
USER root
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Set up workspace
WORKDIR /home/coder/workspace

# Switch back to coder user
USER coder

# Expose port
EXPOSE 8080

# Start code-server
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none", "--disable-telemetry"]