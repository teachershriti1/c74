import React from 'react'
import { Text, View,ScrollView, FlatList, TextInput,StyleSheet ,TouchableOpacity} from 'react-native'
import db from '../config'

export default class SearchScreen extends React.Component{
  constructor(props){
    super(props)
    this.state={
      allTransactions:[],
      lastVisibleTransaction:null,
      search:''
    }
  }

  searchTransaction=async(text)=>{
var enteredText=text.split("")
var text=text.toUpperCase()
if(enteredText[0].toUpperCase()==="B"){
  const transaction=await db.collection("Transactions").where("bookId","==",text).get()
  transaction.docs.map((doc)=>{
    this.setState({
      allTransactions:[...this.state.allTransactions,doc.data()],
      lastVisibleTransaction:doc

    })
  })
}
else if(enteredText[0].toUpperCase()==="S"){
  const transaction=await db.collection("Transactions").where("studentId","==",text).get()
  transaction.docs.map((doc)=>{
    this.setState({
      allTransactions:[...this.state.allTransactions,doc.data()],
      lastVisibleTransaction:doc

    })
  })
}
  }

   

fetchMoreTransactions=async()=>{
  var text=this.state.search.toUpperCase()
  var enteredText=text.split("")
  if(enteredText[0].toUpperCase()==="B"){
const query=await db.collection("Transactions").where("bookId","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
query.docs.map((doc)=>{
this.setState({
  allTransactions:[...this.state.allTransactions,doc.data()],
  lastVisibleTransaction:doc
})
}) 
  }
  else if(enteredText[0].toUpperCase()==="S"){
    const query=await db.collection("Transactions").where("studentId","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    query.docs.map((doc)=>{
    this.setState({
      allTransactions:[...this.state.allTransactions,doc.data()],
      lastVisibleTransaction:doc
    })
    }) 
      }
}

render(){ 
  return(
<View style={styles.container}>
  <View style={styles.searchBar}>
    <TextInput style={styles.bar}
    placeholder="Enter student Id or book Id"
    onChangeText={(text)=>{
      this.setState({search:text})
    }}/>
    <TouchableOpacity style={styles.searchButton}
    onPress={()=>{
      this.searchTransaction(this.state.search)
    }}>
      <Text>Search</Text>
    </TouchableOpacity>
    </View>
      <FlatList data={this.state.allTransactions}
      renderItem={({item})=>(
        <View style={{borderBottomWidth:2}}>
        <Text>{"Book Id "+item.bookId}</Text>
        <Text>{"Student Id "+item.studentId}</Text>
         <Text>{"Transaction Type "+item.transactionType}</Text>
          <Text>{"Date "+item.data}</Text>
       </View>
)}
keyExtractor={(item,index)=>index.toString()}
onEndReached={this.fetchMoreTransactions}
onEndReachThreshold={0.7}
/>
  </View>
  ) 
}  
}  
const styles=StyleSheet.create({
  container:{
    flex:1,
    marginTop:20
  },
  searchBox:{
    flexDirection:'row',
    height:40,
    width:'auto',
    borderWidth:0.5,
    alignItems:'center',
    backgroundColor:'grey',

  },
  bar:{
    borderWidth:2,
    height:30,
    width:300,
    paddingLeft:10,

  },
  searchButton:{
    borderWidth:1,
    height:30,
    width:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'green'
  }
})
