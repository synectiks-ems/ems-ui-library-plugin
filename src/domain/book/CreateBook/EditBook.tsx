import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { commonFunctions } from '../../_utilites/common.functions';
import  "../../../css/custom.css";
import '../../../css/college-settings.css';
import '../../../css/tabs.css'; 
import {MessageBox} from '../../Message/MessageBox'
import { withApollo } from 'react-apollo';
import { ADD_BOOK, CREATE_LIBRARY_FILTER_DATA_CACHE, GET_BOOK_LIST } from '../_queries';
import * as moment from 'moment';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';


export interface BookProps extends React.HTMLAttributes<HTMLElement>{
    [data: string]: any; 
    bookList?:any;
    bookData?:any;
    departments?:any;
    bookobj?:any;
    bkObj?:any;
    user?:any;
    onSaveUpdate?: any;
    createLibraryDataCache?: any;
    departmentList: any;

}
const ERROR_MESSAGE_MANDATORY_FIELD_MISSING = 'Mandatory fields missing';
const ERROR_MESSAGE_SERVER_ERROR = "Due to some error in book service, book could not be saved. Please check book service logs";
const SUCCESS_MESSAGE_BOOK_ADDED = "New book saved successfully";
const SUCCESS_MESSAGE_BOOK_UPDATED = "book updated successfully";
const ERROR_MESSAGE_DATES_OVERLAP = "Due Date cannot be prior or same as Issue date";
class BookObj {
  id: any;
  shelfNo: any;
  bookTitle: any;
  author: any;
  edition: any;
  publisher: any;
  isbNo: any;
  noOfCopies: any;
  // noOfCopiesAvailable: any;
  department: any;

  constructor(id: any, shelfNo: any, bookTitle: any, author: any, 
              edition: any, publisher: any, isbNo: any, noOfCopies: any, 
              // noOfCopiesAvailable: any, 
              department: any) {
    this.id = id;
    this.shelfNo = shelfNo;
    this.bookTitle = bookTitle;
    this.author = author;
    this.edition = edition;
    this.publisher = publisher;
    this.isbNo = isbNo;
    this.noOfCopies = noOfCopies;
    // this.noOfCopiesAvailable = noOfCopiesAvailable;
    this.department = department;
  }
}

class BookGrid<T = {[data: string]: any}> extends React.Component<BookProps, any> {
    constructor(props: BookProps) {
        super(props);
        this.state = {     
            bookList: this.props.bookList,
            createLibraryDataCache: this.props.createLibraryDataCache,
            isModalOpen: false,
            user: this.props.user,
            bookobj: this.props.bookobj,
            bkObj: this.props.data,
            departmentList: this.props.departmentList,
            departments: this.props.departments,
            errorMessage: '',
            successMessage: '',
            activeTab: 0,
            booklistObj:{
              department:{
                id:""
              },
                shelfNo:'',
                bookTitle:'',
                author:'',
                publisher:'',
                edition:'',
                noOfCopies:'',
                isbNo:'',
                departmentId:'',
            },
            bookData:{
             department:{
               id:''
             },  
         },
            //  departments:[],
        };  
        this.createDepartment = this.createDepartment.bind(this);
        this.getInput = this.getInput.bind(this); 
        this.addBook = this.addBook.bind(this);
        this.editInputValue = this.editInputValue.bind(this);
        this.onChange = this.onChange.bind(this);
        this.validateField = this.validateField.bind(this);
        // this.save = this.save.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.doSave = this.doSave.bind(this);
        this.getcreateLibraryFilterDataCache = this.getcreateLibraryFilterDataCache.bind(this);
        }
    
  // async componentDidMount(){
  //   this.setState({
  //     bkObj: this.props.data,
  //   });
  // await this.registerSocket();
  //   // console.log('check batches:', this.props.batches);
  //   console.log('1.test bkObj data:', this.state.bkObj);
  //   console.log('30. test bookobj data state:', this.state.bookobj);
  //   console.log('40. test bookobj data props:', this.props.bookobj);
  //   this.editInputValue();
  // }
  async componentDidMount() {

    await this.getBook();
}
getBook = async () => {
    const { data } = await this.props.client.query({
        query: GET_BOOK_LIST,
        fetchPolicy: 'no-cache'
    })
    var arr = data.getBookList;
    let i;
    let finalAry = [];
    for (i in arr) {
      let obj = new BookObj(arr[i].id, arr[i].shelfNumber, arr[i].bookTitle, 
                            arr[i].author, arr[i].publisher,arr[i].edition, arr[i].noOfCopies, 
                            // arr[i].noOfCopiesAvailable,
                            arr[i].isbNo, arr[i].department.name);
        finalAry.push(obj);
    }
    console.log("Final Array : ", finalAry);
    this.setState({
        bookList: finalAry,
    });

    console.log(" state variable Book data :::", this.state.bookList);
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
        bkObj: this.props.data,
      });
    //   console.log('check batches:', this.props.batches);
      console.log('2. test bkObj data:', this.state.bkObj);
      console.log('30. test bookobj data state:', this.state.bookobj);
      console.log('40. test bookobj data props:', this.props.bookobj);
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
      onChange = (e: any) => {
        e.preventDefault();
        const { name, value } = e.nativeEvent.target;
        const { booklistObj, bookData } = this.state;
        if (name === 'department') {
          this.setState({
            bookData: {
              ...bookData,
              department: {
                id: value,
              },
            },
          });
        } else {
          this.setState({
            booklistObj: {
              ...booklistObj,
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
    toggleTab(tabNo: any) {
        this.setState({
          activeTab: tabNo,
        });
      }
    async doSave(bookInput: any, id: any){
        let btn = document.querySelector('#' +id);
        btn && btn.setAttribute('disabled', 'true');
        let exitCode = 0;
        
        await this.props.client.mutate({
            mutation: ADD_BOOK,
            variables: { 
                input: bookInput,
            },
        }).then((resp: any) => {
            console.log(
                'Success in addBook Mutation. Exit code : ',resp.data.addBook.cmsBookVo.exitCode);
            exitCode = resp.data.addBook.cmsBookVo.exitCode;
            let temp = resp.data.addBook.cmsBookVo.dataList; 
            console.log("New Book list : ", temp);
            let i;
            let ary = [];
            let obj;
            for (i in temp) {
              obj = new BookObj(
                temp[i].id,
                 temp[i].shelfNo, 
                 temp[i].bookTitle, 
                 temp[i].author, 
                 temp[i].edition, 
                 temp[i].publisher, 
                 temp[i].isbNo, 
                 temp[i].noOfCopies, 
                //  temp[i].noOfCopiesAvailable, 
                 temp[i].department.name);
              ary.push(obj);
            }
            this.setState({
                bookList: ary  
            });
        })
        .catch((error: any) => {
            exitCode = 1;
            console.log('Error in addBook : ', error);
        });
        btn && btn.removeAttribute('disabled');
        let errorMessage = '';
        let successMessage = '';
        if(exitCode === 0){
            successMessage = SUCCESS_MESSAGE_BOOK_ADDED;
            if(bookInput.id !== null) {
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
    addBook = (e: any) => {
        const { id } = e.nativeEvent.target;
        const {booklistObj, bookData,modelHeader} = this.state;
        // let isValid = this.validateField();
        // if(isValid === false){
        //     return;
        // }
        // if(!this.validateField()){
        //     return;
        // }
        let isValid = this.validateField(booklistObj,bookData);
        if(isValid === false){
            return;
        }
        const bookInput = this.getInput(booklistObj, modelHeader);
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
     
    validateField(booklistObj: any, bookData: any) {
        let isValid = true;
        let errorMessage = ""
        if(booklistObj.shelfNo === undefined || booklistObj.shelfNo === null || booklistObj.shelfNo === ""){
            commonFunctions.changeTextBoxBorderToError((booklistObj.shelfNo === undefined || booklistObj.shelfNo === null) ? "" : booklistObj.shelfNo, "shelfNo");
            errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
            isValid = false;
        }
        if(booklistObj.bookTitle === undefined || booklistObj.bookTitle === null || booklistObj.bookTitle === ""){
            commonFunctions.changeTextBoxBorderToError((booklistObj.bookTitle === undefined || booklistObj.bookTitle === null) ? "" : booklistObj.bookTitle , "bookTitle");
            errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
            isValid = false;
        }
        if(booklistObj.noOfCopies === undefined || booklistObj.noOfCopies === null || booklistObj.noOfCopies === ""){
            commonFunctions.changeTextBoxBorderToError((booklistObj.noOfCopies === undefined || booklistObj.noOfCopies === null) ? "" : booklistObj.noOfCopies, "noOfCopies");
            errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
            isValid = false;
            }
            // if(booklistObj.department.id === undefined || booklistObj.department.id === null || booklistObj.department.id === ""){
            //   commonFunctions.changeTextBoxBorderToError((booklistObj.department.id === undefined || booklistObj.department.id === null) ? "" : booklistObj.department.id, "department");
            if(bookData.department.id === undefined || bookData.department.id === null || bookData.department.id === ""){
              commonFunctions.changeTextBoxBorderToError((bookData.department.id === undefined || bookData.department.id === null) ? "" : bookData.department.id, "department"); 
            errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
              isValid = false;
          }
            this.setState({
              errorMessage: errorMessage
          }); 
          return isValid; 
          }   

// editInputValue(obj: any) {
//   const { booklistObj } = this.state;
//   let txtSn: any = document.querySelector("#shelfNo");
//   let txtBt: any = document.querySelector("#bookTitle");
//   let txtAu: any = document.querySelector("#author");
//   let txtPb: any = document.querySelector("#publisher");
//   let txtEd: any = document.querySelector("#edition");
//   let txtNc: any = document.querySelector("#noOfCopies");
//   let txtIn: any = document.querySelector("#isbNo");
  
//   txtSn.value = obj.shelfNumber;
//   txtBt.value = obj.bookTitle;
//   txtAu.value = obj.author;
//   txtPb.value = obj.publisher;
//   txtEd.value = obj.edition;
//   txtNc.value = obj.noOfCopies;
//   txtIn.value = obj.isbNo;

//   booklistObj.book.id = obj.id;
//   booklistObj.shelfNo = obj.shelfNo;
//   booklistObj.bookTitle = obj.bookTitle;
//   booklistObj.author = obj.author;
//   booklistObj.publisher = obj.publisher;
//   booklistObj.edition = obj.edition;
//   booklistObj.noOfCopies = obj.noOfCopies;
//   booklistObj.isbNo = obj.isbNo;

//   this.setState({
    
//     booklistObj: booklistObj
//   });
// }

editInputValue() {
    // e && e.preventDefault();
    const { booklistObj, bkObj, bookData,branchId } = this.state;
    let bkValue: any = '';
    bkValue = this.props.bookobj;
    console.log('100. test bookobj data:', bkValue);
    this.setState({
        booklistObj: {
            ...booklistObj,
            id: bkValue.id,
            shelfNo: bkValue.shelfNumber,
            bookTitle: bkValue.bookTitle,
            author: bkValue.author,
            publisher: bkValue.publisher,
            edition: bkValue.edition,
            noOfCopies: bkValue.noOfCopies,
            isbNo: bkValue.isbNo,
            departmentId: bkValue.departmentId,
            branchId: branchId
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
  getInput(booklistObj: any, modelHeader: any){
    const{bookData,branchId}=this.state;
    // let id = null;
    // if(modelHeader === "EditBook"){
    //     id = booklistObj.id;
    // }
    let bookInput = {
      id:
      booklistObj.id !== null || booklistObj.id !== undefined || booklistObj.id !== ''
        ? booklistObj.id
        : null,
        shelfNo: booklistObj.shelfNo,
        bookTitle: booklistObj.bookTitle,
        author: booklistObj.author,
        publisher: booklistObj.publisher,
        edition: booklistObj.edition,
        noOfCopies: booklistObj.noOfCopies,
        isbNo: booklistObj.isbNo,
        departmentId: bookData.department.id,
        // departmentId: booklistObj.department.id,
        branchId: branchId
    };
    return bookInput;
}
    
render() {
const {isModalOpen, bList, activeTab,bookData, booklistObj,createLibraryDataCache, errorMessage, successMessage,departmentId} = this.state;
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
              Edit Book Data</div>
          <div id="saveLibraryCatDiv" className="fee-flex">
            <button className="btn btn-primary mr-1" id="btnSaveFeeCategory" name="btnSaveFeeCategory" onClick={this.addBook} style={{ width: '140px' }}>Update Book</button>
            {/* <button className="btn btn-primary mr-1" id="btnUpdateFeeCategory" name="btnUpdateFeeCategory" onClick={this.addLibrary} style={{ width: '170px' }}>Update Book</button> */}
          </div>
        </div>
        <div id="feeCategoryDiv" className="b-1">
        <div className="form-grid">
           <div>
           <label htmlFor="">
              Shelf Number <span style={{ color: 'red' }}> * </span></label>
            <input type="text" 
           required className="gf-form-input fwidth" 
           maxLength={255} 
            onChange={this.onChange}  
            value={booklistObj.shelfNo} 
            placeholder="shelfNo" 
            name="shelfNo" 
            id="shelfNo"/>
           </div>
             <div>
             <label htmlFor="">
             Book Title<span style={{ color: 'red' }}> * </span></label>
             <input type="text" 
             required className="gf-form-input fwidth" 
             maxLength={255}  
             onChange={this.onChange}  
             value={booklistObj.bookTitle} 
               placeholder="bookTitle" 
               name="bookTitle" 
               id="bookTitle"/>
           </div>
          <div>
             <label htmlFor="">
             Author<span style={{ color: 'red' }}> * </span></label>
             <input type="text" 
             required className="gf-form-input fwidth" 
             maxLength={255}  
             onChange={this.onChange}  
             value={booklistObj.author} 
              placeholder="author" 
              name="author" 
              id="author"/>
           </div>
           <div>
             <label htmlFor="">
             Publisher<span style={{ color: 'red' }}> * </span></label>
             <input type="text" 
             required className="gf-form-input fwidth" 
             maxLength={255}  
             onChange={this.onChange}  
             value={booklistObj.publisher} 
             placeholder="publisher" 
             name="publisher" 
             id="publisher"/>
           </div>
          <div>
             <label htmlFor="">
             Edition<span style={{ color: 'red' }}> * </span></label>
             <input type="text" 
             required className="gf-form-input fwidth" 
             maxLength={255}  
             onChange={this.onChange}  
             value={booklistObj.edition} 
             placeholder="edition" 
             name="edition" 
             id="edition"/>
           </div>
           <div>
             <label htmlFor="">
             No Of Copies<span style={{ color: 'red' }}> * </span></label>
             <input type="text" 
             required className="gf-form-input fwidth" 
             maxLength={255}  
             onChange={this.onChange}  
             value={booklistObj.noOfCopies} 
              placeholder="noOfCopies" 
              name="noOfCopies" 
             id="noOfCopies"/>
           </div>
           <div>
             <label htmlFor="">
             ISB Number<span style={{ color: 'red' }}> * </span></label>
             <input type="text" 
             required className="gf-form-input fwidth" 
             maxLength={255}  
             onChange={this.onChange}  
             value={booklistObj.isbNo} 
             placeholder="isbNo" 
             name="isbNo" 
             id="isbNo"/>
           </div>
           {/* <div>
           <label htmlFor="">
               Department<span style={{ color: 'red' }}> * </span></label>
              <select required name="department" 
              id="department" 
              onChange={this.onChange}  
              value={bookData.department.id} 
              className="gf-form-input fwidth"
              style={{ width: '255px' }}>
                {createLibraryDataCache !== null &&
                  createLibraryDataCache !== undefined &&
                  createLibraryDataCache.departments !== null &&
                  createLibraryDataCache.departments !== undefined
                    ? this.createDepartment(
                        createLibraryDataCache.departments
                      )
                    : null}
              </select>
            </div> */}
           <div>
             <label className="gf-form-label b-0 bg-transparent">
             {/* Department<span style={{ color: 'red' }}> * </span></label> */}
                 Department ::: {bookData.department.id}<span style={{ color: 'red' }}> * </span></label>
              <select name="department"
              id="department"
              onChange={this.onChange}
              value={bookData.department.id}
              // value={booklistObj.department.id}
              className="fwidth"
              style={{ width: '250px' }}>
                {/* {this.createDepartment(createLibraryFilterDataCache.departments)} */}
                {/* {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.departments !== null &&
                  createLibraryFilterDataCache.departments !== undefined
                    ? this.createDepartment(
                        createLibraryFilterDataCache.departments
                      )
                    : null} */}
                    {this.createDepartment(this.state.departments)}
              </select>
            </div>
          </div>
        </div>
      </section>
  );
}
}
export default withApollo(BookGrid);