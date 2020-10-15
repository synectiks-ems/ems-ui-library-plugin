import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { commonFunctions } from '../../_utilites/common.functions';
import  "../../../css/custom.css";
import '../../../css/college-settings.css';
import '../../../css/tabs.css'; 
import {MessageBox} from '../../Message/MessageBox'
import { withApollo } from 'react-apollo';
import * as moment from 'moment';
import { ADD_ISSUE_BOOK, CREATE_LIBRARY_FILTER_DATA_CACHE } from "../_queries";
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';

export interface IssueBookProps extends React.HTMLAttributes<HTMLElement>{
  [data: string]: any;
  issueBookList?: any;  
  bookList?: any;
  bookData?: any;
  user?: any;
  // batch?:any;
  // student?:any;
  // branchId: any;
  // departmentId: any;
  createLibraryDataCache?: any;
  departmentList: any;
}
const ERROR_MESSAGE_MANDATORY_FIELD_MISSING = "Mandatory fields missing";
const ERROR_MESSAGE_SERVER_SIDE_ERROR = "Due to some error in library service, issuebook could not be saved. Please check library service logs";
const SUCCESS_MESSAGE_ISSUEBOOK_ADDED = "New issuebook saved successfully";
const SUCCESS_MESSAGE_ISSUEBOOK_UPDATED = "IssueBook updated successfully";
const ERROR_MESSAGE_DATES_OVERLAP = "Due Date cannot be prior or same as Issue date";
const ERROR_MESSAGE_DATE_OVERLAP = "Received Date cannot be prior to Issue date";

class IssueBook<T = {[data: string]: any}> extends React.Component<IssueBookProps, any> {
  constructor(props: IssueBookProps) {
      super(props);
      this.state = {
        issueBookList: this.props.issueBookList,
        departmentList: this.props.departmentList,
        createLibraryDataCache: this.props.createLibraryDataCache,
        bookList: this.props.bookList,
        user:this.props.user,
        branchId: null,
        // departmentId: null,
          // isModalOpen: false,
          errorMessage: "",
          successMessage: "",
          issueBookObj: {
            issueDate:"",
            dueDate:"",
            bookStatus:"",
            bookId:"",
            batchId:"",
            studentId:"",
            departmentId:""
            // batch:{
            //   id:"",
            //  },
            //  student:{
            //   id:"",
            // },
            // department:{
            //   id:"",
            // },
      },
      bookData:{
        batch:{
          id:"",
        },
        student:{
          id:"",
        },
        department:{
            id:"",
        },
    },
    departments: [],
    batches: [],
    students:[],
    };
      this.createBatch = this.createBatch.bind(this); 
      this.createStudent = this.createStudent.bind(this); 
      this.registerSocket = this.registerSocket.bind(this);
      this.createDepartment = this.createDepartment.bind(this);   
      this.isDatesOverlap = this.isDatesOverlap.bind(this);

  }

  async componentDidMount(){
    await this.registerSocket();
  }
  
  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
    socket.onmessage = (response: any) => {
      let message = JSON.parse(response.data);
      console.log('Book index. message received from server ::: ', message);
      this.setState({
        branchId: message.selectedBranchId,
        academicYearId: message.selectedAcademicYearId,
        departmentId: message.selectedDepartmentId,
      });
      console.log('Book index. branchId: ', this.state.branchId);
      console.log('Book index. departmentId: ', this.state.departmentId);
      console.log('Book index. ayId: ', this.state.academicYearId);
    };

    socket.onopen = () => {
      console.log("Book index. Opening websocekt connection on index.tsx. User : ",this.state.user.login);
        // this.state.user
        socket.send(this.state.user.login);
    }
    window.onbeforeunload = () => {
      console.log('Book index. Closing websocekt connection on index.tsx');
    };
}
createDepartment(departments: any) {
  let departmentsOptions = [
    <option key={0} value="">
      Select department
    </option>,
  ];
  for (let i = 0; i < departments.length; i++) {
      departmentsOptions.push(
      <option key={departments[i].id} value={departments[i].id}>
        {departments[i].name}
      </option>
    );
  }
  return departmentsOptions;
}
createBatch(batches: any) {
  let batchesOptions = [
    <option key={0} value="">
      Select Year
    </option>,
  ];
  for (let i = 0; i < batches.length; i++) {
      batchesOptions.push(
      <option key={batches[i].id} value={batches[i].id}>
        {batches[i].batch}
      </option>
    );
  }
  return batchesOptions;
}

createStudent(students: any) {
  let studentsOptions = [
    <option key={0} value="">
      Select Student
    </option>,
  ];
  for (let i = 0; i < students.length; i++) {
      studentsOptions.push(
      <option key={students[i].id} value={students[i].id}>
        {students[i].rollNo}
      </option>
    );
  }
  return studentsOptions;
}

onChange = (e: any) => {
  e.preventDefault();
  const { name, value } = e.nativeEvent.target;
  const { issueBookObj,bookData } = this.state; 
  if (name === 'department') {
    this.setState({
      bookData: {
        ...bookData,
        department: {
          id: value,
        },
        batch: {
          id: '',
        },
        student:{
          id:'',
        },
      },
    });
  }
  else if (name === 'batch') {
    this.setState({
      bookData: {
        ...bookData,
        batch: {
          id: value,
        },
        student:{
          id:'',
        },
      },
    });
  }
  else if (name === 'student') {
    this.setState({
      bookData: {
        ...bookData,
        student: {
          id: value,
        },
      },
    });
  } else {
    this.setState({
      issueBookObj: {
        ...issueBookObj,
        [name]: value,
      },
      bookData: {
        ...bookData,
        [name]: value,
      },
      errorMessage: '',
      successMessage: '',
    });
  }
  commonFunctions.restoreTextBoxBorderToNormal(name);
}

getInput(issueBookObj: any){
  const {branchId,bookData, departmentId} = this.state;
  let id = null;
  let noOfCopiesAvailable = null;
  let strReceivedDate = null;
  // if(modelHeader === "Edit IssueBook"){
  //     id = issueBookObj.id;
  //     strReceivedDate = moment(issueBookObj.receivedDate).format("DD-MM-YYYY")
  // }
  let ayInput = {
      id: id,
      batchId:bookData.batch.id,
      studentId:bookData.student.id,
      bookId:issueBookObj.bookId,
      departmentId: bookData.department.id,
      branchId: branchId,
      bookStatus: issueBookObj.bookStatus,
      strIssueDate: moment(issueBookObj.issueDate).format("DD-MM-YYYY"),
      strDueDate: moment(issueBookObj.dueDate).format("DD-MM-YYYY"), 
      // strReceivedDate: moment(issueBookObj.receivedDate).format("DD-MM-YYYY"),           
  };
  return ayInput;
}
isMandatoryField(objValue: any, obj: any){
  let errorMessage = "";
  if(objValue === undefined || objValue === null || objValue.trim() === ""){
    let tempVal = "";
    commonFunctions.changeTextBoxBorderToError(tempVal, obj);
    errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
  }
  return errorMessage;
}
isDatesOverlap(dueDate: any, receivedDate: any) {
  if (receivedDate.isBefore(dueDate)) {
    alert('ReceivedDate should not be prior to DueDate.');
    return true;
  }
  return false;
}
validateFields(issueBookObj: any, bookData: any){
  // const {branchId, departmentId} = this.state;
  let isValid = true;
  let errorMessage = ""
  // if(bookData.branchId === undefined || branchId === null || branchId === ""){
  //     errorMessage = "Please select branch from user preferences";
  //     isValid = false;
  //     this.setState({
  //         errorMessage: errorMessage
  //     });
  //     return isValid;
  // }
  // if(bookData.department.id === undefined || bookData.department.id === null || bookData.department.id === ""){
  //   commonFunctions.changeTextBoxBorderToError((bookData.department.id === undefined || bookData.department.id === null) ? "" : bookData.department.id, "department");
  //   errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
  //   isValid = false;
  //     this.setState({
  //         errorMessage: errorMessage
  //     });
  //     return isValid;
  // }
  if(issueBookObj.issueDate === undefined || issueBookObj.issueDate === null || issueBookObj.issueDate === "")
  {
      commonFunctions.changeTextBoxBorderToError((issueBookObj.issueDate === undefined || issueBookObj.issueDate === null) ? "" : issueBookObj.issueDate, "issueDate");
      errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
      isValid = false;
  }
  if(issueBookObj.dueDate === undefined || issueBookObj.dueDate === null || issueBookObj.dueDate === "")
  {
      commonFunctions.changeTextBoxBorderToError((issueBookObj.dueDate === undefined || issueBookObj.dueDate === null) ? "" : issueBookObj.dueDate, "dueDate");
      errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
      isValid = false;
  }
  if(issueBookObj.bookStatus === undefined || issueBookObj.bookStatus === null || issueBookObj.bookStatus === "")
  {
      commonFunctions.changeTextBoxBorderToError((issueBookObj.bookStatus === undefined || issueBookObj.bookStatus === null) ? "" : issueBookObj.bookStatus, "bookStatus");
      errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
      isValid = false;
   }
  // if(issueBookObj.bookId === undefined || issueBookObj.bookId === null || issueBookObj.bookId === "")
  // {
  //     commonFunctions.changeTextBoxBorderToError((issueBookObj.bookId === undefined || issueBookObj.bookId === null) ? "" : issueBookObj.bookId, "book");
  //     errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
  //     isValid = false;
  // }
  // if(bookData.batchId === undefined || bookData.batch.id === null || bookData.batch.id === ""){
  //     commonFunctions.changeTextBoxBorderToError((bookData.batch.id === undefined || bookData.batch.id === null) ? "" : bookData.batch.id, "batch");
  //     errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
  //     isValid = false;
  //   }
  //   if(bookData.studentId === undefined || bookData.studentId === null || bookData.studentId === ""){
  //       commonFunctions.changeTextBoxBorderToError((bookData.student.id === undefined || bookData.student.id === null) ? "" : bookData.student.id, "student");
  //       errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
  //       isValid = false;
  //   }
  //   if(bookData.department.id === undefined || bookData.department.id === null || bookData.department.id === ""){
  //     commonFunctions.changeTextBoxBorderToError((bookData.department.id === undefined || bookData.department.id === null) ? "" : bookData.department.id, "department");
  //     errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
  //     isValid = false;
  // }
    if(isValid){
      isValid = this.validateDates(issueBookObj.issueDate, issueBookObj.dueDate, issueBookObj.receivedDate);
      if(isValid === false){
          errorMessage = ERROR_MESSAGE_DATES_OVERLAP;
          // errorMessage = ERROR_MESSAGE_DATE_OVERLAP;
      }
   }
    this.setState({
        errorMessage: errorMessage
    });
    return isValid; 

}

validateDates(issueDate: any, dueDate: any, receivedDate:any){
  let id = moment(issueDate, "YYYY-MM-DD");
  let dd = moment(dueDate, "YYYY-MM-DD");
  let rd = moment(receivedDate, "YYYY-MM-DD");
  if (dd.isSameOrBefore(id) || id.isSameOrAfter(dd) || rd.isBefore(id)) {
    return false;
  }
   return true;
  }
  async getcreateLibraryFilterDataCache() {
    const {data} = await this.props.client.query({
      query: CREATE_LIBRARY_FILTER_DATA_CACHE,
      variables: {
      },

      fetchPolicy: 'no-cache',
    });
    this.setState({
      createLibraryDataCache: data,
    });
  }
  async doSave(issueBookInput: any, id: any){
    let btn = document.querySelector("#"+id);
    btn && btn.setAttribute("disabled", "true");
    let exitCode = 0;
    
    await this.props.client.mutate({
        mutation: ADD_ISSUE_BOOK,
        variables: { 
            input: issueBookInput
        },
    }).then((resp: any) => {
        console.log("Success in saveIssueBook Mutation. Exit code : ",resp.data.addIssueBook.cmsIssueBookVo.exitCode);
        exitCode = resp.data.addIssueBook.cmsIssueBookVo.exitCode;
        let temp = resp.data.addIssueBook.cmsIssueBookVo.dataList; 
        console.log("New IssueBookList list : ", temp);
        this.setState({
            issueBookList: temp
        });
    }).catch((error: any) => {
        exitCode = 1;
        console.log('Error in saveIssueBook : ', error);
    });
    btn && btn.removeAttribute("disabled");
    
    let errorMessage = "";
    let successMessage = "";
    if(exitCode === 0 ){
        successMessage = SUCCESS_MESSAGE_ISSUEBOOK_ADDED;
        if(issueBookInput.id !== null){
            successMessage = SUCCESS_MESSAGE_ISSUEBOOK_UPDATED;
        }
    }else {
        errorMessage = ERROR_MESSAGE_SERVER_SIDE_ERROR;
    }
    this.setState({
        successMessage: successMessage,
        errorMessage: errorMessage
    });
}

saveIssueBook = (e: any) => {
  const { id } = e.nativeEvent.target;
  const {issueBookObj, bookData} = this.state;
  // e.preventDefault();
  // issueBookObj.errorMessage = "";

  let isValid = this.validateFields(issueBookObj, bookData);
  if(isValid === false){
      return;
  }
  const issueBookInput = this.getInput(issueBookObj);
  this.doSave(issueBookInput, id);
}
render() {
  const {issueBookList, bookData, isModalOpen,issueBookObj,bookList,createLibraryDataCache, modelHeader, errorMessage, successMessage} = this.state;
    return (
      <section className="plugin-bg-white p-1">
      {
         errorMessage !== ""  ? 
             <MessageBox id="mbox" message={errorMessage} activeTab={2}/>        
             : null
     }
     {
         successMessage !== ""  ?   
             <MessageBox id="mbox" message={successMessage} activeTab={1}/>        
             : null
     }
       <div className="bg-heading px-1 dfinline m-b-1">
         <h5 className="mtf-8 dark-gray">Library Management</h5>
       </div>
       <div id="headerRowDiv" className="b-1 h5-fee-bg j-between">
         <div className="m-1 fwidth">Add IssueBook Data</div>
         <div id="saveLibraryCatDiv" className="fee-flex">
           <button className="btn btn-primary mr-1" id="btnSaveFeeCategory" name="btnSaveFeeCategory" onClick={this.saveIssueBook} style={{ width: '140px' }}>IssueBook</button>
           {/* <button className="btn btn-primary mr-1" id="btnUpdateFeeCategory" name="btnUpdateFeeCategory" onClick={this.addBook} style={{ width: '170px' }}>Update Book</button> */}
         </div>
       </div>
       <div id="feeCategoryDiv" className="b-1">
       <div className="form-grid">
       <div>
          <label htmlFor="">
              Department<span style={{ color: 'red' }}> * </span></label>
             <select required name="department" 
             id="department" 
             onChange={this.onChange}  
             value={bookData.department.id} 
             className="gf-form-input fwidth"
             style={{ width: '255px' }}>
               {/* {this.createDepartment(createLibraryDataCache.departments)} */}
               {createLibraryDataCache !== null &&
                 createLibraryDataCache !== undefined &&
                 createLibraryDataCache.departments !== null &&
                 createLibraryDataCache.departments !== undefined
                   ? this.createDepartment(
                       createLibraryDataCache.departments
                     )
                   : null}
             </select>
           </div>
           <div>
          <label htmlFor="">
              Batch<span style={{ color: 'red' }}> * </span></label>
             <select required name="batch" 
             id="batch" 
             onChange={this.onChange}  
             value={bookData.batch.id} 
             className="gf-form-input fwidth"
             style={{ width: '255px' }}>
               {/* {this.createDepartment(createLibraryDataCache.departments)} */}
               {createLibraryDataCache !== null &&
                 createLibraryDataCache !== undefined &&
                 createLibraryDataCache.batches !== null &&
                 createLibraryDataCache.batches !== undefined
                   ? this.createBatch(
                       createLibraryDataCache.batches
                     )
                   : null}
             </select>
           </div>
           <div>
          <label htmlFor="">
              Student<span style={{ color: 'red' }}> * </span></label>
             <select required name="student" 
             id="student" 
             onChange={this.onChange}  
             value={bookData.student.id} 
             className="gf-form-input fwidth"
             style={{ width: '255px' }}>
               {/* {this.createDepartment(createLibraryDataCache.departments)} */}
               {createLibraryDataCache !== null &&
                 createLibraryDataCache !== undefined &&
                 createLibraryDataCache.students !== null &&
                 createLibraryDataCache.students !== undefined
                   ? this.createStudent(
                       createLibraryDataCache.students
                     )
                   : null}
             </select>
           </div>

                             <div>
                             <label className="gf-form-label b-0 bg-transparent">Book<span style={{ color: 'red' }}> * </span></label>
                                        <select name="bookId" id="bookId" onChange={this.onChange} value={issueBookObj.bookId} className="gf-form-label b-0 bg-transparent">
                                        <option value="">Select Book</option>
                                        {
                                            commonFunctions.createSelectbox(bookList, "id", "id", "bookTitle")
                                        }
                                        </select>
                                 </div> 
                                 <div className="fwidth-modal-text m-r-1">
                                        <label className="gf-form-label b-0 bg-transparent">No Of Copies Available<span style={{ color: 'red' }}> * </span></label>
                                        <select name="bookId" id="bookId" onChange={this.onChange} value={issueBookObj.bookId} className="gf-form-label b-0 bg-transparent">
                                        <option value="">Select No Of Copies Available</option>
                                        {
                                            commonFunctions.createSelectbox(bookList, "id", "id", "noOfCopiesAvailable")
                                        }
                                        </select>
                                 </div>
                  

          <div>
            <label htmlFor="">
            IssueDate<span style={{ color: 'red' }}> * </span></label>
            <input type="Date" 
            required className="gf-form-input fwidth" 
            maxLength={255}  
            onChange={this.onChange}  
            value={issueBookObj.issueDate} 
            placeholder="issueDate" 
							  name="issueDate" 
							  id="issueDate" />
          </div>
          <div>
            <label htmlFor="">
            DueDate<span style={{ color: 'red' }}> * </span></label>
            <input type="Date" 
            required className="gf-form-input fwidth" 
            maxLength={255}  
            onChange={this.onChange}  
            value={issueBookObj.dueDate} 
            placeholder="dueDate" 
             name="dueDate" 
             id="dueDate"  />
          </div>
        
          <div className="fwidth-modal-text">
          <label  className="gf-form-label b-0 bg-transparent">bookStatus<span style={{ color: 'red' }}> * </span></label>
          <select required name="bookStatus" id="bookStatus" onChange={this.onChange} value={issueBookObj.bookStatus} className="gf-form-input">
          <option key={""} value={""}>Select bookStatus</option>
          <option key={"ISSUED"} value={"ISSUED"}>ISSUED</option>
          <option key={"RECEIVED"} value={"RECEIVED"}>RECEIVED</option>
         <option key={"NOTRECEIVED"} value={"NOTRECEIVED"}>NOTRECEIVED</option>
         </select>
        </div>

         </div>
       </div>

     </section>
       );
   }
}
export default withApollo(IssueBook);