import { useMediaQuery } from "@react-hook/media-query";
import Image from "next/image";

import objects from "@/data/objects.json";

import type { TrinketItem } from "@/types/items";

import { Dispatch, SetStateAction, useContext, useMemo } from "react";

import { PlayersContext } from "@/contexts/players-context";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMixpanel } from "@/contexts/mixpanel-context";
import { IconExternalLink } from "@tabler/icons-react";
import { CreatePlayerRedirect } from "../createPlayerRedirect";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { ScrollArea } from "../ui/scroll-area";

interface Props {
  open: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  trinket: TrinketItem | null;
}

export const MuseumSheet = ({ open, setIsOpen, trinket }: Props) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { activePlayer, patchPlayer } = useContext(PlayersContext);
  const mixpanel = useMixpanel();

  const [artifacts, minerals] = useMemo(() => {
    if (!activePlayer) return [new Set([]), new Set([])];

    const artifacts = activePlayer?.museum?.artifacts ?? [];
    const minerals = activePlayer?.museum?.minerals ?? [];

    return [new Set(artifacts), new Set(minerals)];
  }, [activePlayer]);

  const iconURL = trinket
    ? objects[trinket.itemID.toString() as keyof typeof objects].iconURL
    : "https://stardewvalleywiki.com/mediawiki/images/f/f3/Lost_Book.png";

  const name =
    trinket && objects[trinket.itemID.toString() as keyof typeof objects].name;

  const description =
    trinket &&
    objects[trinket.itemID.toString() as keyof typeof objects].description;

  // Either "Minerals" or "Arch"
  const category =
    trinket && objects[trinket.itemID as keyof typeof objects].category;

  async function handleStatusChange(status: number) {
    if (!activePlayer || !trinket) return;

    if (category !== "Minerals" && category !== "Arch") return;

    let patch = {};
    if (category === "Arch") {
      if (status === 2) artifacts.add(parseInt(trinket.itemID));
      if (status === 0) artifacts.delete(parseInt(trinket.itemID));

      patch = {
        museum: {
          artifacts: Array.from(artifacts),
        },
      };
    } else if (category === "Minerals") {
      if (status === 2) minerals.add(parseInt(trinket.itemID));
      if (status === 0) minerals.delete(parseInt(trinket.itemID));

      patch = {
        museum: {
          minerals: Array.from(minerals),
        },
      };
    }

    await patchPlayer(patch);
    setIsOpen(false);
  }

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setIsOpen}>
        <SheetContent>
          <SheetHeader className="mt-4">
            <div className="flex justify-center">
              <Image
                src={iconURL}
                alt={name ? name : "No Info"}
                height={64}
                width={64}
              />
            </div>
            <SheetTitle className="text-center">
              {name ? name : "No Info"}
            </SheetTitle>
            <SheetDescription className="text-center italic">
              {description ? description : "No Description Found"}
            </SheetDescription>
          </SheetHeader>
          {trinket && (
            <div className="space-y-6 mt-4">
              <section className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  {artifacts.has(parseInt(trinket.itemID)) ? (
                    <Button
                      variant="secondary"
                      disabled={
                        !activePlayer ||
                        (!artifacts.has(parseInt(trinket.itemID)) &&
                          !minerals.has(parseInt(trinket.itemID)))
                      }
                      data-umami-event="Set incompleted"
                      onClick={() => {
                        handleStatusChange(0);
                        mixpanel?.track("Button Clicked", {
                          Action: "Set Incompleted",
                          Artifact: name,
                          "Button Type": "Museum card",
                          Location: "Museum sheet",
                        });
                      }}
                    >
                      Set Incomplete
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      disabled={
                        !activePlayer ||
                        artifacts.has(parseInt(trinket.itemID)) ||
                        minerals.has(parseInt(trinket.itemID))
                      }
                      data-umami-event="Set completed"
                      onClick={() => {
                        handleStatusChange(2);
                        mixpanel?.track("Button Clicked", {
                          Action: "Set Completed",
                          Artifact: name,
                          "Button Type": "Museum card",
                          Location: "Museum sheet",
                        });
                      }}
                    >
                      Set Completed
                    </Button>
                  )}
                  {!activePlayer && <CreatePlayerRedirect />}
                  {name && (
                    <Button
                      variant="outline"
                      data-umami-event="Visit wiki"
                      asChild
                      onClick={() =>
                        mixpanel?.track("Button Clicked", {
                          Action: "Visit Wiki",
                          Location: "Fish sheet",
                        })
                      }
                    >
                      <a
                        className="flex items-center"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://stardewvalleywiki.com/${name.replaceAll(
                          " ",
                          "_"
                        )}`}
                      >
                        Visit Wiki Page
                        <IconExternalLink className="h-4"></IconExternalLink>
                      </a>
                    </Button>
                  )}
                </div>
              </section>
              <section className="space-y-2">
                {trinket.locations && (
                  <>
                    <h3 className="font-semibold">Location</h3>
                    <Separator />
                    <ul className="list-disc list-inside">
                      {trinket.locations.map((location) => (
                        <li
                          key={location}
                          className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm"
                        >
                          {location}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
              <section className="space-y-2">
                {trinket.used_in && trinket.used_in.length > 0 && (
                  <>
                    <h3 className="font-semibold">Used In</h3>
                    <Separator />
                    <ul className="list-disc list-inside">
                      {trinket.used_in.map((location) => (
                        <li
                          key={location}
                          className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm"
                        >
                          {location}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setIsOpen}>
      <DrawerContent className="fixed bottom-0 left-0 right-0 max-h-[90dvh]">
        <ScrollArea className="overflow-auto">
          <DrawerHeader className="mt-4 -mb-4">
            <div className="flex justify-center">
              <Image
                src={iconURL}
                alt={name ? name : "No Info"}
                height={64}
                width={64}
              />
            </div>
            <DrawerTitle className="text-center">
              {name ? name : "No Info"}
            </DrawerTitle>
            <DrawerDescription className="text-center italic">
              {description ? description : "No Description Found"}
            </DrawerDescription>
          </DrawerHeader>
          {trinket && (
            <div className="space-y-6 p-6">
              <section className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  {artifacts.has(parseInt(trinket.itemID)) ? (
                    <Button
                      variant="secondary"
                      disabled={
                        !activePlayer ||
                        (!artifacts.has(parseInt(trinket.itemID)) &&
                          !minerals.has(parseInt(trinket.itemID)))
                      }
                      data-umami-event="Set incompleted"
                      onClick={() => {
                        handleStatusChange(0);
                        mixpanel?.track("Button Clicked", {
                          Action: "Set Incompleted",
                          Artifact: name,
                          "Button Type": "Museum card",
                          Location: "Museum sheet",
                        });
                      }}
                    >
                      Set Incomplete
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      disabled={
                        !activePlayer ||
                        artifacts.has(parseInt(trinket.itemID)) ||
                        minerals.has(parseInt(trinket.itemID))
                      }
                      data-umami-event="Set completed"
                      onClick={() => {
                        handleStatusChange(2);
                        mixpanel?.track("Button Clicked", {
                          Action: "Set Completed",
                          Artifact: name,
                          "Button Type": "Museum card",
                          Location: "Museum sheet",
                        });
                      }}
                    >
                      Set Completed
                    </Button>
                  )}
                  {!activePlayer && <CreatePlayerRedirect />}
                  {name && (
                    <Button
                      variant="outline"
                      data-umami-event="Visit wiki"
                      asChild
                      onClick={() =>
                        mixpanel?.track("Button Clicked", {
                          Action: "Visit Wiki",
                          Location: "Fish sheet",
                        })
                      }
                    >
                      <a
                        className="flex items-center"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://stardewvalleywiki.com/${name.replaceAll(
                          " ",
                          "_"
                        )}`}
                      >
                        Visit Wiki Page
                        <IconExternalLink className="h-4"></IconExternalLink>
                      </a>
                    </Button>
                  )}
                </div>
              </section>
              <section className="space-y-2">
                {trinket.locations && (
                  <>
                    <h3 className="font-semibold">Location</h3>
                    <Separator />
                    <ul className="list-disc list-inside">
                      {trinket.locations.map((location) => (
                        <li
                          key={location}
                          className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm"
                        >
                          {location}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
              <section className="space-y-2">
                {trinket.used_in && trinket.used_in.length > 0 && (
                  <>
                    <h3 className="font-semibold">Used In</h3>
                    <Separator />
                    <ul className="list-disc list-inside">
                      {trinket.used_in.map((location) => (
                        <li
                          key={location}
                          className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm"
                        >
                          {location}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
