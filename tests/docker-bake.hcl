target "default" {
  dockerfile = "Dockerfile"
}

target "multiarch" {
  inherits = ["default"]
  platforms = [
    "linux/amd64",
    "linux/arm64",
    "linux/arm/v7"
  ]
}
