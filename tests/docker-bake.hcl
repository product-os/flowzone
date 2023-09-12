target "default" {
  dockerfile = "Dockerfile"
  platforms = [
    "linux/amd64"
  ]
}

target "multiarch" {
  dockerfile = "Dockerfile"
  platforms = [
    "linux/amd64",
    "linux/arm64",
    "linux/arm/v7",
    "linux/arm/v6"
  ]
}
