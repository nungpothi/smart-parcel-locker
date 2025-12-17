DOCKER_VERSION=getMatchLogDev-$1
DOCKER_NAME=test
DOCKER_REGISTRY=registry.gitlab.com/give-me-bug/checkin:getMatchLogDev-082125
DOCKER_CONTAINER_NAME=test
#docker login registry.gitlab.com
docker pull $DOCKER_REGISTRY
docker rm -f $DOCKER_CONTAINER_NAME || true
docker network create -d bridge dota2-network || true
docker tag $DOCKER_REGISTRY $DOCKER_NAME:latest 
docker rmi $DOCKER_REGISTRY || true
DOCKER_REGISTRY=$DOCKER_NAME:latest
docker run \
  --name $DOCKER_CONTAINER_NAME \
  -d \
  -e APP_VERSION=$DOCKER_VERSION \
  -e OM_MIN_RANK=74 \
  -e OM_MAX_RANK=105 \
  $DOCKER_REGISTRY
exit
# rm -r test.sh ; nano test.sh; chmod +x test.sh ; ./test.sh;
#sudo kill -9 `sudo lsof -t -i:5000`