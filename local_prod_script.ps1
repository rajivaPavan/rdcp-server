# Define the path to your environment file
$envFilePath = ".\.env.production.local"

# Define the Docker image you want to run
$imageName = "rdcp-server-prod"

$containerName = "rdcp-server-prop"


docker build -f Dockerfile.prod -t $imageName .    

# remove the container if it exists
docker rm -f $containerName

# Run the Docker container with the environment file
docker run -d -it -p 3000:3000 --name $containerName --net rdcp-server_rdcp_network --env-file $envFilePath $imageName 