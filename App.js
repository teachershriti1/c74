import React from 'react'
import {StylesSheet,Text,View} from 'react-native'
import {createAppContainer} from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import TransactionScreen from './screens/bookTransactionScreen'
import SearchScreen from './screens/searchScreen'

export default class App extends React.Component{
  render(){
    return(
      <AppContainer/>
    )
  }
}

const TabNavigator=createBottomTabNavigator({
  Transaction:{screen:TransactionScreen},
  Search:{screen:SearchScreen}
})

const AppContainer=createAppContainer(TabNavigator)