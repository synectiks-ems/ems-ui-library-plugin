import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { commonFunctions } from '../../_utilites/common.functions';
import  "../../../css/custom.css";
import '../../../css/college-settings.css';
import '../../../css/tabs.css'; 
import {MessageBox} from '../../Message/MessageBox'
import { withApollo } from 'react-apollo';
import { ADD_ISSUE_BOOK, CREATE_LIBRARY_FILTER_DATA_CACHE } from '../_queries';
import * as moment from 'moment';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';


export interface IssueBookProps extends React.HTMLAttributes<HTMLElement>{
    [data: string]: any; 
    issueBookList?:any;
    issueBookData?:any;
    departments?:any;
    batches?:any;
    students?: any;
    books?: any;
    issueBookObj?:any;
    ibObj?:any;
    user?:any;
    onSaveUpdate?: any;
    createLibraryDataCache?: any;
    departmentList: any;

}
const ERROR_MESSAGE_MANDATORY_FIELD_MISSING = 'Mandatory fields missing';
const ERROR_MESSAGE_SERVER_ERROR = "Due to some error in IssueBook service, issueBook could not be updated. Please check issueBook service logs";
const SUCCESS_MESSAGE_BOOK_ADDED = "New book saved successfully";
const SUCCESS_MESSAGE_BOOK_UPDATED = "IssueBook updated successfully";
const ERROR_MESSAGE_DATES_OVERLAP = "Due Date cannot be prior or same as Issue date";
const ERROR_MESSAGE_DATE_OVERLAP = "Received Date cannot be prior to Issue date";

class IssueBookGrid<T = {[data: string]: any}> extends React.Component<IssueBookProps, any> {
    constructor(props: IssueBookProps) {
        super(props);
        this.state = {     
            issueBookList: this.props.issueBookList,
            createLibraryDataCache: this.props.createLibraryDataCache,
            isModalOpen: false,
            user: this.props.user,
            issueBookObj: this.props.issueBookObj,
            ibObj: this.props.data,
            departmentList: this.props.departmentList,
            departments: this.props.departments,
            batches: this.props.batches,
            students: this.props.students,
            books: this.props.books,
            errorMessage: '',
            successMessage: '',
            activeTab: 0,
            issueBookListObj:{
              issueDate:"",
              dueDate:"",
              receivedDate: "",
              bookStatus:"",
              bookId:"",
              batchId:"",
              studentId:"",
              departmentId:""
            },
            issueBookData:{
             department:{
               id:''
             },  
             batch:{
              id:"",
            },
            student:{
              id:"",
            },
            book:{
              id: "",
            }
         },
            //  departments:[],
        };  
        this.createBatch = this.createBatch.bind(this); 
        this.createStudent = this.createStudent.bind(this); 
        this.createBook = this.createBook.bind(this);
        this.registerSocket = this.registerSocket.bind(this);
        this.createDepartment = this.createDepartment.bind(this);   
        this.isDatesOverlap = this.isDatesOverlap.bind(this);
        this.getInput = this.getInput.bind(this); 
        this.addIssueBook = this.addIssueBook.bind(this);
        this.editInputValue = this.editInputValue.bind(this);
        this.onChange = this.onChange.bind(this);
        this.validateFields = this.validateFields.bind(this);
        // this.save = this.save.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.doSave = this.doSave.bind(this);
        this.getcreateLibraryFilterDataCache = this.getcreateLibraryFilterDataCache.bind(this);
        }
    
        async componentDidMount(){
         this.setState({
         ibObj: this.props.data,
         });

        await this.registerSocket();
        // console.log('check batches:', this.props.batches);
         console.log('1.test ibObj data:', this.state.ibObj);
         console.log('30. test issueBookObj data state:', this.state.issueBookObj);
         console.log('40. test issueBookObj data props:', this.props.issueBookObj);
        this.editInputValue();
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

    componentWillReceiveProps() {
      this.setState({
        ibObj: this.props.data,
      });
    //   console.log('check batches:', this.props.batches);
      console.log('2. test ibObj data:', this.state.ibObj);
      console.log('30. test issueBookObj data state:', this.state.issueBookObj);
      console.log('40. test issueBookObj data props:', this.props.issueBookObj);
      this.editInputValue();
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

    createDepartment(departments: any) {
        let departmentsOptions = [
          <option key={0} value="">
            Select department
          </option>,
        ];
        for (let i = 0; i < departments.length; i++) {
          let id = departments[i].id;
            departmentsOptions.push(
            <option key={id} value={id}>
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
      
      createBook(books: any) {
        let booksOptions = [
          <option key={0} value="">
            Select Book
          </option>,
        ];
        for (let i = 0; i < books.length; i++) {
          booksOptions.push(
            <option key={books[i].id} value={books[i].id}>
              {books[i].bookTitle}
            </option>
          );
        }
        return booksOptions;
      }
    

      onChange = (e: any) => {
        e.preventDefault();
        const { name, value } = e.nativeEvent.target;
        const { issueBookListObj,issueBookData } = this.state; 
        if (name === 'department') {
          this.setState({
            issueBookData: {
              ...issueBookData,
              department: {
                id: value,
              },
              batch: {
                id: '',
              },
              student:{
                id:'',
              },
              book:{
                id:'',
              }
            },
          });
        }
        else if (name === 'batch') {
          this.setState({
            issueBookData: {
              ...issueBookData,
              batch: {
                id: value,
              },
              student:{
                id:'',
              },
              book:{
                id:'',
              }
            },
          });
        }
        else if (name === 'student') {
          this.setState({
            issueBookData: {
              ...issueBookData,
              student: {
                id: value,
              },
              book:{
                id: value,
              }
            },
          });
        } 
        else if (name === 'book') {
          this.setState({
            issueBookData: {
              ...issueBookData,
              book:{
                id: value,
              }
            },
          });
        }else {
          this.setState({
            issueBookListObj: {
              ...issueBookListObj,
              [name]: value,
            },
            issueBookData: {
              ...issueBookData,
              [name]: value,
            },
            errorMessage: '',
            successMessage: '',
          });
        }
        commonFunctions.restoreTextBoxBorderToNormal(name);
      }
      
    toggleTab(tabNo: any) {
        this.setState({
          activeTab: tabNo,
        });
      }
      
    async doSave(issueBookInput: any, id: any){
        let btn = document.querySelector('#' +id);
        btn && btn.setAttribute('disabled', 'true');
        let exitCode = 0;
        
        await this.props.client.mutate({
            mutation: ADD_ISSUE_BOOK,
            variables: { 
                input: issueBookInput,
            },
        }).then((resp: any) => {
            console.log(
                'Success in addBook Mutation. Exit code : '
            ,resp.data.addIssueBook.cmsIssueBookVo.exitCode
            );
            exitCode = resp.data.addIssueBook.cmsIssueBookVo.exitCode;
            let temp = resp.data.addIssueBook.cmsIssueBookVo.dataList; 
            console.log("New Issue Book list : ", temp);
            this.setState({
                issueBookList: temp  
            });
        })
        .catch((error: any) => {
            exitCode = 1;
            console.log('Error in addIssueBook : ', error);
        });
        btn && btn.removeAttribute('disabled');
        let errorMessage = '';
        let successMessage = '';
        if(exitCode === 0){
            successMessage = SUCCESS_MESSAGE_BOOK_ADDED;
            if(issueBookInput.id !== null) {
                successMessage = SUCCESS_MESSAGE_BOOK_UPDATED;
            }
        }else {
            errorMessage = ERROR_MESSAGE_SERVER_ERROR;
        }
        this.setState({
            successMessage: successMessage,
            errorMessage: errorMessage,
        });
    }

    addIssueBook = (e: any) => {
        const { id } = e.nativeEvent.target;
        const {issueBookListObj, issueBookData,modelHeader} = this.state;
        // let isValid = this.validateField();
        // if(isValid === false){
        //     return;
        // }
        // if(!this.validateField()){
        //     return;
        // }
        let isValid = this.validateFields(issueBookListObj,issueBookData);
        if(isValid === false){
            return;
        }
        const bookInput = this.getInput(issueBookListObj, modelHeader);
        this.doSave(bookInput, id);
    }
//     save = (e: any) => {
//         const { id } = e.nativeEvent.target;
//         const {booklistObj, bookData} = this.state;
//         if (!this.validateField()) {
//             this.toggleTab(0);
//             return;
//     }
//     const bookInput = this.getInput(booklistObj);
//       this.doSave(bookInput, id);
// };


 
// const bookInput = this.getInput(booklistObj);
// this.doSave(bookInput, id);
// }

    
    isMandatoryField(objValue: any, obj: any) {
        let errorMessage = '';
        if (objValue === undefined || objValue === null || objValue.trim() === '') {
          let tempVal = '';
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

      validateFields(issueBookListObj: any, bookData: any){
        // const {branchId, departmentId} = this.state;
        let isValid = true;
        let errorMessage = ""
        if(issueBookListObj.issueDate === undefined || issueBookListObj.issueDate === null || issueBookListObj.issueDate === "")
        {
            commonFunctions.changeTextBoxBorderToError((issueBookListObj.issueDate === undefined || issueBookListObj.issueDate === null) ? "" : issueBookListObj.issueDate, "issueDate");
            errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
            isValid = false;
        }
        if(issueBookListObj.dueDate === undefined || issueBookListObj.dueDate === null || issueBookListObj.dueDate === "")
        {
            commonFunctions.changeTextBoxBorderToError((issueBookListObj.dueDate === undefined || issueBookListObj.dueDate === null) ? "" : issueBookListObj.dueDate, "dueDate");
            errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
            isValid = false;
        }
        if(issueBookListObj.bookStatus === undefined || issueBookListObj.bookStatus === null || issueBookListObj.bookStatus === "")
        {
            commonFunctions.changeTextBoxBorderToError((issueBookListObj.bookStatus === undefined || issueBookListObj.bookStatus === null) ? "" : issueBookListObj.bookStatus, "bookStatus");
            errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
            isValid = false;
         }
        // if(bookData.bookId === undefined || bookData.bookId === null || bookData.bookId === "")
        // {
        //     commonFunctions.changeTextBoxBorderToError((bookData.bookId === undefined || bookData.bookId === null) ? "" : bookData.bookId, "book");
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
            isValid = this.validateDates(issueBookListObj.issueDate, issueBookListObj.dueDate, issueBookListObj.receivedDate);
            if(isValid === false){
                errorMessage = ERROR_MESSAGE_DATES_OVERLAP;
                errorMessage = ERROR_MESSAGE_DATE_OVERLAP;
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
      
   editInputValue() {
    const { issueBookListObj, ibObj, issueBookData,departmentId,branchId } = this.state;
    let ibValue: any = '';
    ibValue = this.props.issueBookObj;
    console.log('100. test issueBookObj data:', ibValue);
    this.setState({
        issueBookListObj: {
            ...issueBookListObj,
             id: ibValue.id,
             batchId:ibValue.batchId,
             studentId:ibValue.studentId,
             bookId:ibValue.bookId,
             departmentId: ibValue.departmentId,
             branchId: branchId,
             bookStatus: ibValue.bookStatus,
             issueDate: moment(ibValue.strIssueDate,"DD-MM-YYYY").format("YYYY-MM-DD"),
             dueDate: moment(ibValue.strDueDate,"DD-MM-YYYY").format("YYYY-MM-DD"),
             strReceivedDate: moment(ibValue.receivedDate).format("DD-MM-YYYY"),       
        },
    });
    return;
}

 
  // getInput(booklistObj: any){
  //     const{bookData, departmentId, bkObj} = this.state;
  //       let bookInput = {
  //           id:
  //           booklistObj.id !== null || booklistObj.id !== undefined ||
  //           booklistObj.id !== ''
  //           ? booklistObj.id
  //           : null,
  //           shelfNo: booklistObj.shelfNo,
  //           bookTitle: booklistObj.bookTitle,
  //           author: booklistObj.author,
  //           publisher: booklistObj.publisher,
  //           edition: booklistObj.edition,
  //           noOfCopies: booklistObj.noOfCopies,
  //           isbNo: booklistObj.isbNo,
  //           departmentId: bookData.department.id,   
  //       };
  //       return bookInput;
  //   }
  getInput(issueBookListObj: any, modelHeader: any){
    const{issueBookData,branchId}=this.state;
    // let id = null;
    // if(modelHeader === "EditBook"){
    //     id = booklistObj.id;
    // }
    let issueBookInput = {
      id:
      issueBookListObj.id !== null || issueBookListObj.id !== undefined || issueBookListObj.id !== ''
        ? issueBookListObj.id
        : null,
      batchId:issueBookData.batch.id,
      studentId:issueBookData.student.id,
      bookId:issueBookData.book.id,
      branchId: branchId,
      bookStatus: issueBookListObj.bookStatus,
      strIssueDate: moment(issueBookListObj.issueDate).format("DD-MM-YYYY"),
      strDueDate: moment(issueBookListObj.dueDate).format("DD-MM-YYYY"),
      strReceivedDate: moment(issueBookListObj.receivedDate).format("DD-MM-YYYY"),  
        departmentId: issueBookData.department.id,
    };
    return issueBookInput;
}
    
render() {
const {isModalOpen, bList, activeTab,issueBookData, issueBookListObj,createLibraryDataCache, errorMessage, successMessage,departmentId} = this.state;
return (
    <section className="plugin-bg-white p-1">
       {
          errorMessage !== ""  ? 
              <MessageBox id="mbox" message={errorMessage} activeTab={2}/>        
              : null}
      { successMessage !== ""  ? 
              <MessageBox id="mbox" message={successMessage} activeTab={1}/>        
              : null
      }<div className="bg-heading px-1 dfinline m-b-1">
          <h5 className="mtf-8 dark-gray">Library Management</h5>
        </div>
        <div id="headerRowDiv" className="b-1 h5-fee-bg j-between">
          <div className="m-1 fwidth">
              Edit IssueBook </div>
          <div id="saveLibraryCatDiv" className="fee-flex">
            <button className="btn btn-primary mr-1" id="btnSaveFeeCategory" name="btnSaveFeeCategory" onClick={this.addIssueBook} style={{ width: '140px' }}>Update IssueBook</button>
            {/* <button className="btn btn-primary mr-1" id="btnUpdateFeeCategory" name="btnUpdateFeeCategory" onClick={this.addLibrary} style={{ width: '170px' }}>Update Book</button> */}
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
             value={issueBookData.department.id} 
             className="gf-form-input fwidth"
             style={{ width: '255px' }}>
               {/* {this.createDepartment(createLibraryDataCache.departments)} */}
               {/* {createLibraryDataCache !== null &&
                 createLibraryDataCache !== undefined &&
                 createLibraryDataCache.departments !== null &&
                 createLibraryDataCache.departments !== undefined
                   ? this.createDepartment(
                       createLibraryDataCache.departments
                     )
                   : null} */}
                 {this.createDepartment(this.state.departments)}  
             </select>
           </div>
           <div>
          <label htmlFor="">
              Batch<span style={{ color: 'red' }}> * </span></label>
             <select required name="batch" 
             id="batch" 
             onChange={this.onChange}  
             value={issueBookData.batch.id} 
             className="gf-form-input fwidth"
             style={{ width: '255px' }}>
               {/* {this.createDepartment(createLibraryDataCache.departments)} */}
               {/* {createLibraryDataCache !== null &&
                 createLibraryDataCache !== undefined &&
                 createLibraryDataCache.batches !== null &&
                 createLibraryDataCache.batches !== undefined
                   ? this.createBatch(
                       createLibraryDataCache.batches
                     )
                   : null} */}
                   {this.createBatch(this.state.batches)}
             </select>
           </div>
           <div>
          <label htmlFor="">
              Student<span style={{ color: 'red' }}> * </span></label>
             <select required name="student" 
             id="student" 
             onChange={this.onChange}  
             value={issueBookData.student.id} 
             className="gf-form-input fwidth"
             style={{ width: '255px' }}>
               {/* {this.createDepartment(createLibraryDataCache.departments)} */}
               {/* {createLibraryDataCache !== null &&
                 createLibraryDataCache !== undefined &&
                 createLibraryDataCache.students !== null &&
                 createLibraryDataCache.students !== undefined
                   ? this.createStudent(
                       createLibraryDataCache.students
                     )
                   : null} */}
                   {this.createStudent(this.state.students)}
             </select>
           </div>
           <div>
          <label htmlFor="">
              Book<span style={{ color: 'red' }}> * </span></label>
             <select required name="book" 
             id="book" 
             onChange={this.onChange}  
             value={issueBookData.book.id} 
             className="gf-form-input fwidth"
             style={{ width: '255px' }}>
               {/* {this.createDepartment(createLibraryDataCache.departments)} */}
               {/* {createLibraryDataCache !== null &&
                 createLibraryDataCache !== undefined &&
                 createLibraryDataCache.books !== null &&
                 createLibraryDataCache.books !== undefined
                   ? this.createBook(
                       createLibraryDataCache.books
                     )
                   : null} */}
                   {this.createBook(this.state.books)}
             </select>
           </div>
           <div>
            <label htmlFor="">
            IssueDate<span style={{ color: 'red' }}> * </span></label>
            <input type="Date" 
            required className="gf-form-input fwidth" 
            maxLength={255}  
            onChange={this.onChange}  
            value={issueBookListObj.issueDate} 
            placeholder="issueDate" 
							  name="issueDate" 
							  id="issueDate" />
          </div>              

          {/* <div>
            <label htmlFor="">
            Issue Date<span style={{ color: 'red' }}> * </span></label>
            <input type="date" required className="gf-form-input fwidth" value={issueBookListObj.issueDate} id={'issueDate' } name="issueDate" maxLength={255} onChange={this.onChange}  />
          </div> */}
          {/* <div> */}
              {/* <div >
              <label className="gf-form-label b-0 bg-transparent">Due Date <span style={{ color: 'red' }}> * </span></label>
              <input type="date" required className="gf-form-input fwidth" value={issueBookListObj.dueDate} id={'dueDate' } name="dueDate" maxLength={255} onChange={this.onChange}   />
            </div> */}
          {/* </div> */}
          <div>
            <label htmlFor="">
            DueDate<span style={{ color: 'red' }}> * </span></label>
            <input type="Date" 
            required className="gf-form-input fwidth" 
            maxLength={255}  
            onChange={this.onChange}  
            value={issueBookListObj.dueDate} 
            placeholder="dueDate" 
             name="dueDate" 
             id="dueDate"  />
          </div>
        
          <div>
            <label htmlFor="">
            ReceivedDate<span style={{ color: 'red' }}> * </span></label>
            <input type="Date" 
            required className="gf-form-input fwidth" 
            maxLength={255}  
            onChange={this.onChange}  
            value={issueBookListObj.receivedDate} 
            placeholder="receivedDate" 
             name="receivedDate" 
             id="receivedDate"  />
          </div>
        
          <div className="fwidth-modal-text">
          <label  className="gf-form-label b-0 bg-transparent">bookStatus<span style={{ color: 'red' }}> * </span></label>
          <select required name="bookStatus" id="bookStatus" onChange={this.onChange} value={issueBookListObj.bookStatus} className="gf-form-input">
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
export default withApollo(IssueBookGrid);