import React from 'react'
import { Appbar } from "react-native-paper";

export default function Header(props) {
    return (
         <Appbar.Header style={{height: 60}}>
            {props.navigation ? 
            <Appbar.BackAction 
                onPress={() => props.navigation.goBack()}
            /> : 
            <Appbar.Action 
                icon="view-headline"
                size={27}
                onPress={(() => props.sideBarIconClicked())}
            /> }
            <Appbar.Content
                title={props.title}
                titleStyle={{fontSize: 19}}
                subtitle={props.date}
            />
        </Appbar.Header>
        );
}

