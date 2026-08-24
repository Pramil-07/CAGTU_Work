import {Grid, Loader} from "@mantine/core";
import React from "react";

import Layout from "@/components/Layout/Layout";
import NoProfile from "@/components/profile/NoProfile";
import UserDetailsCard from "@/components/profile/UserDetailsCard";
import UserProfileTab from "@/components/profile/UserProfileTab";
import {useProfile} from "@/hooks/useProfile";

const Profile = () => {
    const {data: profile, isLoading} = useProfile();
    return (
        <Layout currentTitle="profile">
            {isLoading ? (
                <Grid gutter={30}>
                    <Grid.Col
                        lg={12}
                        sx={{display: "flex", justifyContent: "center"}}
                    >
                        <Loader/>
                    </Grid.Col>
                </Grid>
            ) : profile ? (
                <Grid gutter={30}>
                    <Grid.Col lg={4}>
                        <UserDetailsCard profile={profile} isOwn={true}/>
                    </Grid.Col>
                    <Grid.Col lg={8}>
                        <UserProfileTab/>
                    </Grid.Col>
                </Grid>
            ) : (
                <NoProfile/>
            )}
        </Layout>
    );
};

export default Profile;
