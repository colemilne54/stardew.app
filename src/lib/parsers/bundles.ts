export function parseBundles(player: any, saveFile: any): any {
  /*
    Bundles:
    -
    -
    -
    -
    -
    -

    JojaMart Development Center (who does this, losers):
    - 5,000 gold for initial membership
    - 40,000 gold for bus to desert
    - 25,000 gold for bridge to Quarry
    - 20,000 gold for glittering boulder
    - 15,000 gold for minecarts
    - 35,000 gold for greenhouse

    - Stardewvalley.Locations.Jojamart.cs::checkAction() -> mailReceived.Contains('JojaMember')

    Additionally, it's possible that users can have a split hybrid of Community Center, as well as Joja Mart. Personally,
    I don't entirely care so I won't be accounting for it.
    */

  const jojaMember = player.mailReceived.includes("JojaMember");

  console.log(jojaMember);
}
