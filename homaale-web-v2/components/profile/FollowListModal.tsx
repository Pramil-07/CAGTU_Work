import { Loader, Modal, ScrollArea, Tabs } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import { useMemo } from "react";
import React from "react";

import { useFollowers } from "@/hooks/follow/useFollowers";
import { useFollowings } from "@/hooks/follow/useFollowings";

import FollowUserBlock from "./FollowUserBlock";

const FollowListModal = ({
    openedFollowList,
    setOpenedFollowList,
}: {
    openedFollowList: boolean;
    setOpenedFollowList: Dispatch<SetStateAction<boolean>>;
}) => {
    const {
        data: FollowersData,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useFollowers();

    const {
        data: FollowingsData,
        hasNextPage: hasNextFollowingPage,
        isFetchingNextPage: isFetchingNextFollowingPage,
        fetchNextPage: fetchNextFollowingPage,
    } = useFollowings();

    const myFollowers = useMemo(
        () =>
            FollowersData?.pages.map((followers) => followers.result).flat() ??
            [],
        [FollowersData?.pages]
    );
    const myFollowings = useMemo(
        () =>
            FollowingsData?.pages
                .map((followings) => followings.result)
                .flat() ?? [],
        [FollowingsData?.pages]
    );

    const isLastFollowerOnPage = (index: number) =>
        index === myFollowers.length - 1;
    const isLastFollowingOnPage = (index: number) =>
        index === myFollowings.length - 1;

    const containerRef = useRef<HTMLDivElement>(null);
    const containerRef2 = useRef<HTMLDivElement>(null);
    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 1,
    });
    const { ref: refs, entry: entries } = useIntersection({
        root: containerRef2.current,
        threshold: 1,
    });

    useEffect(() => {
        if (entry?.isIntersecting) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
        if (entries?.isIntersecting) {
            if (hasNextFollowingPage && !isFetchingNextFollowingPage) {
                fetchNextFollowingPage();
            }
        }
    }, [entry, entries]);

    return (
        <>
            <Modal
                opened={openedFollowList}
                onClose={() => setOpenedFollowList(false)}
                withCloseButton={false}
                overlayProps={{
                    opacity: 0.55,
                    blur: 3,
                }}
                size="md"
                className="delete-modal"
                padding={24}
            >
                <Tabs defaultValue="followers">
                    <Tabs.List grow>
                        <Tabs.Tab value="followers">Followers</Tabs.Tab>
                        <Tabs.Tab value="followings">Followings</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="followers" pt="xs">
                        <ScrollArea.Autosize
                            mah={700}
                            offsetScrollbars
                            scrollbarSize={5}
                            ref={containerRef}
                        >
                            {myFollowers && myFollowers.length > 0
                                ? myFollowers.map((item, index) => {
                                      return (
                                          <div
                                              key={index}
                                              ref={
                                                  isLastFollowerOnPage(index)
                                                      ? ref
                                                      : null
                                              }
                                          >
                                              <FollowUserBlock user={item} />
                                          </div>
                                      );
                                  })
                                : ""}
                            {isFetchingNextPage ? <Loader /> : null}
                        </ScrollArea.Autosize>
                    </Tabs.Panel>
                    <Tabs.Panel value="followings" pt="xs">
                        <ScrollArea.Autosize
                            mah={700}
                            offsetScrollbars
                            scrollbarSize={5}
                            ref={containerRef2}
                        >
                            {myFollowings && myFollowings.length > 0
                                ? myFollowings.map((item, index) => {
                                      return (
                                          <div
                                              key={index}
                                              ref={
                                                  isLastFollowingOnPage(index)
                                                      ? refs
                                                      : null
                                              }
                                          >
                                              <FollowUserBlock user={item} />
                                          </div>
                                      );
                                  })
                                : ""}
                            {isFetchingNextFollowingPage ? <Loader /> : null}
                        </ScrollArea.Autosize>
                    </Tabs.Panel>
                </Tabs>
            </Modal>
        </>
    );
};

export default FollowListModal;
