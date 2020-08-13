import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { commonFunctions } from '../../_utilites/common.functions';
import  "../../../css/custom.css";
import '../../../css/college-settings.css';
import '../../../css/tabs.css'; 
import {MessageBox} from '../../Message/MessageBox'
import { withApollo } from 'react-apollo';
import * as moment from 'moment';
import { ADD_BOOK, CREATE_LIBRARY_FILTER_DATA_CACHE } from "../_queries";
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';


export interface BookProps extends React.HTMLAttributes<HTMLElement>{
    [data: string]: any;
    bookList?: any;
    bookData?:any;
    user?:any;
    onSaveUpdate?: any;
    createLibraryFilterDataCache: null,
    departmentList: any;
}

const ERROR_MESSAGE_MANDATORY_FIELD_MISSING = "Mandatory fields missing";
const ERROR_MESSAGE_SERVER_SIDE_ERROR = "Due to some error in book service, book could not be saved. Please check library service logs";
const SUCCESS_MESSAGE_BOOK_ADDED = "New book saved successfully";
const SUCCESS_MESSAGE_BOOK_UPDATED = "book  updated successfully";

class BookGrid<T = {[data: string]: any}> extends React.Component<BookProps, any> {
    constructor(props: BookProps) {
         super(props);
         this.state = {
          bookList: this.props.bookList,
          departmentList: this.props.departmentList,
          user:this.props.user,
          createLibraryFilterDataCache: this.props.createLibraryFilterDataCache,
          errorMessage: "",
          successMessage: "",
          modelHeader:"",
          isModalOpen: false,
          bookObj: {
            department:{
              id:""
            },
            shelfNo:"",
            bookTitle:"",
            author:"",
            publisher:"",
            edition:"",
            noOfCopies:"",
            isbNo:"",
            departmentId:"",
          },
          bookData:{
              department:{
                  id:''
              }
          },
          departments: [],
      };
      this.createDepartment = this.createDepartment.bind(this);  
        this.createRows = this.createRows.bind(this);
        this.checkAllBooks = this.checkAllBooks.bind(this);
        this.onClickCheckbox = this.onClickCheckbox.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    
    async registerSocket() {
        const socket = wsCmsBackendServiceSingletonClient.getInstance();
        // socket.onmessage = (response: any) => {
        //   let message = JSON.parse(response.data);
        //   console.log('Book index. message received from server ::: ', message);
        //   this.setState({
        //     branchId: message.selectedBranchId,
        //     academicYearId: message.selectedAcademicYearId,
        //     departmentId: message.selectedDepartmentId,
        //   });
        //   console.log('Book index. branchId: ', this.state.branchId);
        //   console.log('Book index. departmentId: ', this.state.departmentId);
        //   console.log('Book index. ayId: ', this.state.academicYearId);
        // };
    
        // socket.onopen = () => {
        //   console.log("Book index. Opening websocekt connection on index.tsx. User : ",this.state.user.login);
        //     // this.state.user
        //     socket.send(this.state.user.login);
        // }
        // window.onbeforeunload = () => {
        //   console.log('Book index. Closing websocekt connection on index.tsx');
        // };
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
    showDetail(e: any, bShow: boolean,bookObj: any, modelHeader: any) {
        e && e.preventDefault();
        // const { lbObj } = this.state;
        // lbObj.id = editObj.id;
        // lbObj.clNo = editObj.clNo;
        // lbObj.bookTitle = editObj.bookTitle;
        // lbObj.bookNo = editObj.bookNo;
        // lbObj.author = editObj.author;
        // lbObj.noOfCopies = editObj.noOfCopies;
        // lbObj.uniqueNo = editObj.uniqueNo;
        // lbObj.departmentId = editObj.departmentId;
        this.setState(() => ({
            isModalOpen: bShow,
            bookObj: bookObj,
            source: this.props.source,
            sourceOfApplication: this.props.sourceOfApplication,
            modelHeader: modelHeader,
            errorMessage: "",
            successMessage: "",
        }));
    }

    createRows(objAry: any) {
        const { source } = this.state;
        console.log("LIBRARY -------->> ", objAry);  
        console.log("createRows() - Book list on AddBookPage:  ", objAry);
        if(objAry === undefined || objAry === null) {
            return;
        }
        const mutateResLength = objAry.length;
        const retVal = [];
        for (let i = 0; i < mutateResLength; i++) {
            const bookObj = objAry[i];
            retVal.push(
              <tr >
                <td>{bookObj.id}</td>
                <td>{bookObj.shelfNo}</td>
                <td>{bookObj.bookTitle}</td>
                <td>{bookObj.author}</td>
                <td>{bookObj.edition}</td>
                <td>{bookObj.publisher}</td>
                <td>{bookObj.isbNo}</td>
                <td>{bookObj.noOfCopies}</td>
                {/* <td>{bookObj.departmentId}</td> */}
                <td>
                    {/* { */}
                        <button className="btn btn-primary" onClick={e => this.showDetail(e, true, bookObj, "Edit Book")}>Edit</button>
                    {/* } */}
                </td>
              </tr>
            );
        }
        return retVal;
    }
editBook(obj: any){
  const { bookObj } = this.state;
      let txtSn: any = document.querySelector("#shelfNo");
      let txtBt: any = document.querySelector("#bookTitle");
      let txtAu: any = document.querySelector("#author");
      let txtPb: any = document.querySelector("#publisher");
      let txtEd: any = document.querySelector("#edition");
      let txtNc: any = document.querySelector("#noOfCopies");
      let txtIn: any = document.querySelector("#isbNo");
      
      txtSn.value = obj.shelfNumber;
      txtBt.value = obj.bookTitle;
      txtAu.value = obj.author;
      txtPb.value = obj.publisher;
      txtEd.value = obj.edition;
      txtNc.value = obj.noOfCopies;
      txtIn.value = obj.isbNo;
  
      bookObj.book.id = obj.id;
      bookObj.shelfNo = obj.shelfNo;
      bookObj.bookTitle = obj.bookTitle;
      bookObj.author = obj.author;
      bookObj.publisher = obj.publisher;
      bookObj.edition = obj.edition;
      bookObj.noOfCopies = obj.noOfCopies;
      bookObj.isbNo = obj.isbNo;
  
      this.setState({
        
        bookObj: bookObj
      });
}

    showModal(e: any, bShow: boolean, headerLabel: any) {
        e && e.preventDefault();
        this.setState(() => ({
            isModalOpen: bShow,
            bookObj: {},
            modelHeader: headerLabel,
            errorMessage: "",
            successMessage: "",
        }));
    }

  getAddBookInput(bookObj: any, modelHeader: any){
    const{bookData}=this.state;
    let id = null;
    if(modelHeader === "Edit Book"){
        id = bookObj.id;
    }
    let bookInput = {
        id: id,
        shelfNo: bookObj.shelfNo,
        bookTitle: bookObj.bookTitle,
        author: bookObj.author,
        publisher: bookObj.publisher,
        edition: bookObj.edition,
        noOfCopies: bookObj.noOfCopies,
        isbNo: bookObj.isbNo,
        // departmentId: bookData.department.id,
    };
    return bookInput;
}
  onChange = (e: any) => {
    e.preventDefault();
    const { name, value } = e.nativeEvent.target;
    const { bookObj,bookData } = this.state;
    
// if (name === 'department') {
//     this.setState({
//       bookData: {
//         ...bookData,
//         department: {
//           id: value,
//         },
//       },
//     });
//   } 
//   else{
    this.setState({
        bookObj: {
            ...bookObj,
            [name]: value
        },
        // bookData: {
        //     ...bookData,
        //     [name]: value,
        //   },
        errorMessage: "",
        successMessage: "",
    });
// }
    commonFunctions.restoreTextBoxBorderToNormal(name);
}
    

validateFields(bookObj: any,bookData: any){
  let isValid = true;
  let errorMessage = ""
  if(bookObj.shelfNo === undefined || bookObj.shelfNo === null || bookObj.shelfNo === ""){
      commonFunctions.changeTextBoxBorderToError((bookObj.shelfNo === undefined || bookObj.shelfNo === null) ? "" : bookObj.shelfNo, "shelfNo");
      errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
      isValid = false;
  }
  if(bookObj.bookTitle === undefined || bookObj.bookTitle === null || bookObj.bookTitle === ""){
      commonFunctions.changeTextBoxBorderToError((bookObj.bookTitle === undefined || bookObj.bookTitle === null) ? "" : bookObj.bookTitle , "bookTitle");
      errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
      isValid = false;
  }
  if(bookObj.noOfCopies === undefined || bookObj.noOfCopies === null || bookObj.noOfCopies === ""){
      commonFunctions.changeTextBoxBorderToError((bookObj.noOfCopies === undefined || bookObj.noOfCopies === null) ? "" : bookObj.noOfCopies, "noOfCopies");
      errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
      isValid = false;
  }
//   if(bookData.department.id === undefined || bookData.department.id === null || bookData.department.id === ""){
//     commonFunctions.changeTextBoxBorderToError((bookData.department.id === undefined || bookData.department.id === null) ? "" : bookData.department.id, "department");
//     errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
//     isValid = false;
// }
this.setState({
    errorMessage: errorMessage
});
return isValid; 
}
async doSave(bookInput: any, id: any){
      let btn = document.querySelector("#"+id);
      btn && btn.setAttribute("disabled", "true");
      let exitCode = 0;

      await this.props.client.mutate({
          mutation: ADD_BOOK,
          variables: { 
              input: bookInput
          },
      }).then((resp: any) => {
          console.log("Success in addBook Mutation. Exit code : ",resp.data.addBook.cmsBookVo.exitCode);
          exitCode = resp.data.addBook.cmsBookVo.exitCode;
          let temp = resp.data.addBook.cmsBookVo.dataList; 
          console.log("New Book list : ", temp);
          this.setState({
              bookList: temp
          });
      }).catch((error: any) => {
          exitCode = 1;
          console.log('Error in addBook : ', error);
      });
      btn && btn.removeAttribute("disabled"); 
      let errorMessage = "";
      let successMessage = "";
      if(exitCode === 0 ){
          successMessage = SUCCESS_MESSAGE_BOOK_ADDED;
          if(bookInput.id !==null){
              successMessage = SUCCESS_MESSAGE_BOOK_UPDATED;
          }
      }else {
          errorMessage = ERROR_MESSAGE_SERVER_SIDE_ERROR;
      }
      this.setState({
          successMessage: successMessage,
          errorMessage: errorMessage
      });
  }
  addBook = (e: any) => {
    const { id } = e.nativeEvent.target;
    const {bookObj,bookData, modelHeader} = this.state;
    // if (!this.validateFields()) {
    //     return;
    //   }
    let isValid = this.validateFields(bookObj,bookData);
    if(isValid === false){
        return;
    }
    const bookInput = this.getAddBookInput(bookObj, modelHeader);
    this.doSave(bookInput, id);
}

checkAllBooks(e: any){
  const { bookObj } = this.state;
  const mutateResLength = bookObj.mutateResult.length;
  let chkAll = e.nativeEvent.target.checked;
  let els = document.querySelectorAll("input[type=checkbox]");

  var empty = [].filter.call(els, function (el: any) {
    if (chkAll) {
      el.checked = true;
    } else {
      el.checked = false;
    }
  }); 
}

onClickCheckbox(index: any, e: any) {
  const { id } = e.nativeEvent.target;
  let chkBox: any = document.querySelector("#" + id);
  chkBox.checked = e.nativeEvent.target.checked;
}

render(){
const {bookData, bookList, isModalOpen, createLibraryFilterDataCache, bookObj, modelHeader, errorMessage, successMessage} = this.state;
return (
            // <main>
            //     <Modal isOpen={isModalOpen} className="react-strap-modal-container" style={{height:"500px", overflow:"auto"}}>
            //         <ModalHeader>{modelHeader}</ModalHeader>
            //         <ModalBody className="modal-content">
            //             <form className="gf-form-group section m-0 dflex">
            //                 <div className="modal-fwidth">
            //                 {
            //                     errorMessage !== ""  ? 
            //                         <MessageBox id="mbox" message={errorMessage} activeTab={2}/>        
            //                         : null
            //                 }
            //                 {
            //                     successMessage !== ""  ? 
            //                         <MessageBox id="mbox" message={successMessage} activeTab={1}/>        
            //                         : null
            //                 }
            //                     <div className="fwidth-modal-text modal-fwidth">
            //                         <label className="gf-form-label b-0 bg-transparent">Row Name <span style={{ color: 'red' }}> * </span></label>
            //                         <input type="text" required className="gf-form-input " onChange={this.onChange}  value={lbObj.clNo} placeholder="clNo" name="clNo" id="clNo" maxLength={150} />
            //                     </div>
            //                         <div className="fwidth-modal-text m-r-1">
            //                             <label className="gf-form-label b-0 bg-transparent">Book Title<span style={{ color: 'red' }}> * </span></label>
            //                             <input type="text" required className="gf-form-input" onChange={this.onChange}  value={lbObj.bookTitle} placeholder="bookTitle" name="bookTitle" id="bookTitle" maxLength={150}/>
            //                         </div>
            //                         <div className="fwidth-modal-text m-r-1">
            //                             <label className="gf-form-label b-0 bg-transparent">Book No</label>
            //                             <input type="text"  className="gf-form-input" onChange={this.onChange}  value={lbObj.bookNo} placeholder="bookNo" name="bookNo" id="bookNo" maxLength={150}/>
            //                         </div>
            //                         <div className="fwidth-modal-text m-r-1">
            //                             <label className="gf-form-label b-0 bg-transparent">Author</label>
            //                             <input type="text"  className="gf-form-input" onChange={this.onChange}  value={lbObj.author} placeholder="author" name="author" id="author" maxLength={150}/>
            //                         </div>
            //                         <div className="fwidth-modal-text m-r-1">
            //                             <label className="gf-form-label b-0 bg-transparent">No Of Copies<span style={{ color: 'red' }}> * </span></label>
            //                             <input type="text" required className="gf-form-input" onChange={this.onChange}  value={lbObj.noOfCopies} placeholder="noOfCopies" name="noOfCopies" id="noOfCopies" maxLength={150}/>
            //                         </div>
            //                         <div className="fwidth-modal-text m-r-1">
            //                             <label className="gf-form-label b-0 bg-transparent">Unique No</label>
            //                             <input type="text"  className="gf-form-input" onChange={this.onChange}  value={lbObj.uniqueNo} placeholder="uniqueNo" name="uniqueNo" id="uniqueNo" maxLength={150}/>
            //                         </div>
            //                         <div className="fwidth-modal-text m-r-1">
            //                           <label htmlFor="">Department<span style={{ color: 'red' }}> * </span></label>
            //                                <select required name="departmentId" id="departmentId" onChange={this.onChange}  value={lbObj.departmentId} className="gf-form-label b-0 bg-transparent">
            //                                 {this.createDepartment(createLibraryFilterDataCache.departments)}
            //                                </select>
            //                         </div>
            //                     <div className="m-t-1 text-center">
            //                         {
            //                             modelHeader === "Add Book" ?
            //                             <button type="button" id="btnAdd" className="btn btn-primary border-bottom" onClick={this.addLibrary} >Save</button>
            //                             :
            //                             <button type="button" id="btnUpdate" className="btn btn-primary border-bottom" onClick={this.addLibrary}>Save</button>
            //                         }
            //                         &nbsp;<button className="btn btn-danger border-bottom" onClick={(e) => this.showModal(e, false, modelHeader)}>Cancel</button>
                           
            //                     </div>
            //                 </div>
            //             </form>
            //         </ModalBody>
            //     </Modal>
            //     <button className="btn btn-primary" style={{width:'200px'}} onClick={e => this.showModal(e, true, "Add New Book")}>
            //         <i className="fa fa-plus-circle"></i> Add Books
            //     </button>
            //     {
            //         lbList !== null && lbList !== undefined && lbList.length > 0 ?
            //             <div style={{width:'100%', height:'250px', overflow:'auto'}}>
            //                 <table id="lbTable" className="striped-table fwidth bg-white p-2 m-t-1">
            //                     <thead>
            //                         <tr>
            //                             <th>Id</th>
            //                             <th>clNo</th>
            //                             <th>bookTitle</th>
            //                             <th>bookNo</th>
            //                             <th>author</th>
            //                             <th>noOfCopies</th>
            //                             <th>Edit</th>
            //                         </tr>
            //                     </thead>
            //                     <tbody>
            //                         { this.createRows(lbList) }
            //                     </tbody>
            //                 </table>
            //             </div>
            //         : null
            //     }
                
            // </main>
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
          <div className="m-1 fwidth">Add Book Data</div>
          <div id="saveLibraryCatDiv" className="fee-flex">
            <button className="btn btn-primary mr-1" id="btnSaveFeeCategory" name="btnSaveFeeCategory" onClick={this.addBook} style={{ width: '140px' }}>Add Book</button>
            <button className="btn btn-primary mr-1" id="btnUpdateFeeCategory" name="btnUpdateFeeCategory" onClick={this.addBook} style={{ width: '170px' }}>Update Book</button>
          </div>
        </div>
        <div id="feeCategoryDiv" className="b-1">
        <div className="b1 row m-1 j-between">

        <div className="mdflex modal-fwidth"> 
        <div className="fwidth-modal-text m-r-1">
           <label htmlFor="">
              Shelf Number 
              <span style={{ color: 'red' }}> * </span></label>
            <input type="text" 
           required className="gf-form-input fwidth" 
           maxLength={255} 
            onChange={this.onChange}  
            value={bookObj.shelfNo} 
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
             value={bookObj.bookTitle} 
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
             value={bookObj.author} 
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
             value={bookObj.publisher} 
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
             value={bookObj.edition} 
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
             value={bookObj.noOfCopies} 
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
             value={bookObj.isbNo} 
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
              style={{ width: '255px' }}> */}
                {/* {this.createDepartment(createLibraryFilterDataCache.departments)} */}
                {/* {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.departments !== null &&
                  createLibraryFilterDataCache.departments !== undefined
                    ? this.createDepartment(
                        createLibraryFilterDataCache.departments
                      )
                    : null}
              </select>
            </div> */}
          </div>
        </div>
        <div className="b1 row m-1">
</div> 
                 </div>

<p></p>
<div>
<table id="studentlistpage" className="striped-table fwidth bg-white">
<thead >
<tr>
  <th>Id</th>
  <th>shelf Number</th>
  <th>Book Title</th>
  <th>Author</th>
  <th>Publisher</th>
  <th>Edition</th>
  <th>isbNo</th>
  <th>No of Copies</th>
  <th>Edit</th>
</tr>
</thead>

<tbody>
{ this.createRows(bookList) }
</tbody> 
</table>

{/* {
this.createNoRecordMessage(this.state.transportRouteObj.mutateResult)
} */}
</div>
      </section>
        );
    }
}

export default withApollo(BookGrid);
