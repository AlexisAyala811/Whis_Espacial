// Distance is horizontal so tall exhibits remain discoverable from the floor.
export function findNearbyLearningObject(items, player, radius=3.3, maxHeight=4.5) {
  let nearest=null;
  for(const item of items){
    const [x,y,z]=item.position;
    const distance=Math.hypot(player.x-x,player.z-z);
    if(distance>radius || Math.abs(player.y-y)>maxHeight || (nearest&&distance>=nearest.distance))continue;
    nearest={...item,distance};
  }
  return nearest;
}
