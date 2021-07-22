import React from 'react'
import { Text, TouchableOpacity, 
  View, StyleSheet, TextInput, Image,
  KeyboardAvoidingView,ToastAndroid} from 'react-native'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
import  firebase from 'firebase'
import db from '../config.js'


export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
            scannedBookId:'',
            scannedStudentId:'',
        }
    }
 

    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions:status==="granted",
            buttonState:id,
            scanned:false,
        })
    }

    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookId"){
this.setState({
    scanned:true,
    buttonState:'normal',
    scannedBookId:data,
    })
        }
        else if(buttonState==="StudentId"){
            this.setState({
                scanned:true,
                buttonState:'normal',
                scannedStudentId:data,
                })
        }
    }
    
    checkStudentEligibilityForBookIssue=async()=>{
const studentRef=await db.collection("Students").where("studentId","==",this.state.scannedStudentId).get()
var isStudentEligible=""   
if(studentRef.docs.length==0){
  this.setState({
    scannedStudentId:'',
    scannedBookId:''
  })
  isStudentEligible=false
  alert("This student Id doesn't exist in the database")
} 
else{
  studentRef.docs.map((doc)=>{
    var student=doc.data()
    if(student.numberOfBooksIssued<2){
      isStudentEligible=true
    }
    else{
      isStudentEligible=false
      alert("The student has already issued two books")
      this.setState({
        scannedStudentId:'',
        scannedBookId:''
      })
    }
    
  })
}
return isStudentEligible;
}

checkStudentEligibilityForBookReturn=async()=>{
  const transactionRef=await db.collection("Transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
var isStudentEligible=""  
transactionRef.docs.map((doc)=>{
  var lastBookTransaction=doc.data()
  if(lastBookTransaction.studentId===this.state.scannedStudentId){
    isStudentEligible=true
  }
  else{
    isStudentEligible=false
    alert("This book wasn't issued by this student")
    this.setState({
scannedStudentId:'',
scannedBookId:''
    })
  }
}) 
return isStudentEligible;
}

checkBookEligibility=async()=>{
  const bookRef=await db.collection("Books").where("bookId","==",this.state.scannedBookId).get()
var transactionType=''
if(bookRef.docs.length==0){
  transactionType=false
}
else{
  bookRef.docs.map((doc)=>{
    var book=doc.data()
    if(book.bookAvailability){
      transactionType="Issue"
    }
    else{
      transactionType="Return"
    }
  })
}
return transactionType;
}

    handleTransaction=async()=>{
    /*var transactionMessage
    db.collection("Books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
        

        var book=doc.data()
        console.log(book)
        if(book.bookAvailability){
            this.initiateBookIssue()
            transactionMessage="book Issued"
        
            ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
        }
        else{
            this.initiateBookReturn()
            transactionMessage="book Returned"
           
            ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
        }
    })
    this.setState({
        transactionMessage:transactionMessage,
    })*/
    var transactionType=await this.checkBookEligibility()
    console.log("Transaction type", transactionType)
    if(!transactionType){
      alert("This book doesnt exist in the library database!");
      this.setState({
        scannedStudentId:'',
        scannedBookId:''
      })
    }
    else if(transactionType==="Issue"){
      var isStudentEligible=await this.checkStudentEligibilityForBookIssue()
      if(isStudentEligible){
        this.initiateBookIssue();
        alert("Book issued to the student!")
      }
     
    }
    else{
      var isStudentEligible=await this.checkStudentEligibilityForBookReturn()
      if(isStudentEligible)  {
        this.initiateBookReturn();
alert("Book returned to the library!")
      }
    }
    }
    
    initiateBookIssue=async()=>    {
        db.collection("Transactions").add({
            'studentId' : this.state.scannedStudentId,
      'bookId' : this.state.scannedBookId,
      'data' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType' : "Issue",
        })

        db.collection("Books").doc(this.state.scannedBookId).update({
            'bookAvailability' : false
          })
          //change number of issued books for student
          db.collection("Students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
          })
      
          this.setState({
            scannedStudentId : '',
            scannedBookId: ''
          })
    }

    initiateBookReturn = async ()=>{
        //add a transaction
        db.collection("Transactions").add({
          'studentId' : this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'date'   : firebase.firestore.Timestamp.now().toDate(),
          'transactionType' : "Return"
        })
    
        //change book status
        db.collection("Books").doc(this.state.scannedBookId).update({
          'bookAvailability' : true
        })
    
        //change book status
        db.collection("Students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })
    
        this.setState({
          scannedStudentId : '',
          scannedBookId : ''
        })
      }

render(){
    const hasCameraPermissions=this.state.hasCameraPermissions;
    const scanned=this.state.scannedData;
    const buttonState=this.state.buttonState;
    if(buttonState!=='normal'&& hasCameraPermissions){
    return(
        <BarCodeScanner onBarCodeScanned=
        {scanned?undefined:this.handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        />

        
    )
    }
    
    else if(buttonState==='normal'){
    return(
      <KeyboardAvoidingView style={styles.container} behaviour="padding" enabled>
        
            <View>
            <Image
        source={require('../assets/booklogo.jpg')} 
        style={{width:200, height:200}}
        />
        <Text style={{textAlign:'center', fontSize:30 }}>Wireless Library</Text>
            </View>
            <View style={styles.inputView}>
                <TextInput style={styles.inputBox}
                placeholder="Book Id"
                onChangeText={(text)=>{
                  this.setState({
                      scannedBookId: text
                  })
                }}
                value = {this.state.scannedBookId}/>
               
            <TouchableOpacity style={styles.scanButton}
            onPress={()=>{
                this.getCameraPermissions('BookId')
            }}
            >
                <Text style={styles.buttonText}>Scan </Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
                <TextInput style={styles.inputBox}
                placeholder="Student Id"
                onChangeText={(text)=>{
                  this.setState({
                      scannedStudentId: text
                  })
                }}
                value = {this.state.scannedStudentId}/>
               
            <TouchableOpacity style={styles.scanButton}
            onPress={()=>{
                this.getCameraPermissions('StudentId')
            }}
            >
                <Text style={styles.buttonText}>Scan </Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity 
            style = {styles.submitButton}
            onPress={async()=>{
              this.handleTransaction();
              
              }}>
                <Text style={styles.submitButtonText}>Submit</Text>

            </TouchableOpacity>

       
        </KeyboardAvoidingView>
    )
    }    
}
}
const styles=StyleSheet.create({
    container:{
        flex:1, 
        justifyContent:'center',
        alignItems:'center'
    },

buttonText:{
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10
  },
  inputView:{
    flexDirection: 'row',
    margin: 20
  },
  inputBox:{
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20
  },
  scanButton:{
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0
  },
  submitButtonText:{
padding:10,
textAlign:'center',
fontSize:20,
fontWeight:'bold',
color:'white'
  },
  submitButton:{
backgroundColor:'#fbc02d',
width:100,
height:50
  },
})