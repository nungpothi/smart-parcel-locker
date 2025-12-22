# Stage 1: Build the Go application
FROM golang:1.22-alpine AS build

WORKDIR /app

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN go build -o main ./cmd/server/main.go

# Stage 2: Run the application
FROM alpine:latest

WORKDIR /app

# Copy the built executable from the build stage
COPY --from=build /app/main .
COPY --from=build /app/.env.example ./.env

# Expose the port the application listens on
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
