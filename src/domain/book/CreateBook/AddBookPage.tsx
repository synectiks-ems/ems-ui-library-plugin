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
    bookData?: any;
    user?: any;
    createLibraryDataCache: any;
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
            createLibraryDataCache: this.props.createLibraryDataCache,
            errorMessage: "",
            successMessage: "",
            branchId: null,
            bookObj: {
              shelfNo:"",
              bookTitle:"",
              author:"",
              publisher:"",
              edition:"",
              noOfCopies:"",
              noOfCopiesAvailable: "",
              isbNo:"",
              departmentId:"",
              batchId: "",
              branchId: ""
            },
            bookData:{
                department:{
                    id:''
                },
                batch:{
                  id: ''
                }
            },
            departments: [],
        };
        this.createDepartment = this.createDepartment.bind(this);  
        this.createBatch = this.createBatch.bind(this); 
        this.registerSocket = this.registerSocket.bind(this);
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
            Select batch
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

    // showDetail(e: any, bShow: boolean,editObj: any, modelHeader: any) {
    //     e && e.preventDefault();
    //     const { lbObj } = this.state;
    //     lbObj.id = editObj.id;
    //     lbObj.clNo = editObj.clNo;
    //     lbObj.bookTitle = editObj.bookTitle;
    //     lbObj.bookNo = editObj.bookNo;
    //     lbObj.author = editObj.author;
    //     lbObj.noOfCopies = editObj.noOfCopies;
    //     lbObj.uniqueNo = editObj.uniqueNo;
    //     lbObj.departmentId = editObj.departmentId;
    //     this.setState(() => ({
    //         isModalOpen: bShow,
    //         lbObj: lbObj,
    //         modelHeader: modelHeader,
    //         errorMessage: "",
    //         successMessage: "",
    //     }));
    // }

    // createRows(objAry: any) {
    //     const { source } = this.state;
    //     console.log("createRows() - Library  list on Library  page:  ", objAry);
    //     if(objAry === undefined || objAry === null) {
    //         return;
    //     }
    //     const aryLength = objAry.length;
    //     const retVal = [];
    //     for (let i = 0; i < aryLength; i++) {
    //         const obj = objAry[i];
    //         retVal.push(
    //           <tr >
    //             <td>{obj.id}</td>
    //             <td>{obj.clNo}</td>
    //             <td>{obj.bookTitle}</td>
    //             <td>{obj.bookNo}</td>
    //             <td>{obj.author}</td>
    //             <td>{obj.noOfCopies}</td>
    //             {/* <td>{obj.departmentId}</td> */}
    //             <td>
    //                 {
    //                     <button className="btn btn-primary" onClick={e => this.showDetail(e, true, obj, "Edit Library")}>Edit</button>
    //                 }
    //             </td>
    //           </tr>
    //         );
    //     }
    //     return retVal;
    // }


    // showModal(e: any, bShow: boolean, headerLabel: any) {
    //     e && e.preventDefault();
    //     this.setState(() => ({
    //         isModalOpen: bShow,
    //         lbObj: {},
    //         modelHeader: headerLabel,
    //         errorMessage: "",
    //         successMessage: "",
    //     }));
    // }

    onChange = (e: any) => {
        e.preventDefault();
        const { name, value } = e.nativeEvent.target;
        const { bookObj,bookData } = this.state;
        
    if (name === 'department') {
        this.setState({
          bookData: {
            ...bookData,
            department: {
              id: value,
            },
          },
        });
      } else if (name === 'batch') {
        this.setState({
          bookData: {
            ...bookData,
            batch: {
              id: value,
            },
          },
        });
      } 
      else{
        this.setState({
            bookObj: {
                ...bookObj,
                [name]: value
            },
            bookData: {
                ...bookData,
                [name]: value,
              },
            errorMessage: "",
            successMessage: "",
        });
    }
        commonFunctions.restoreTextBoxBorderToNormal(name);
    }

    getAddBookInput(bookObj: any){
        const{bookData,branchId}=this.state;
        let id = null;
        // if(modelHeader === "Edit Library"){
        //     id = bookObj.id;
        // }
        let bookInput = {
            id: id,
            shelfNo: bookObj.shelfNo,
            bookTitle: bookObj.bookTitle,
            author: bookObj.author,
            publisher: bookObj.publisher,
            edition: bookObj.edition,
            noOfCopies: bookObj.noOfCopies,
            noOfCopiesAvailable: bookObj.noOfCopiesAvailable,
            isbNo: bookObj.isbNo,
            departmentId: bookData.department.id,
            batchId: bookData.batch.id,
            branchId: branchId
        };
        return bookInput;
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
      if(bookObj.noOfCopiesAvailable === undefined || bookObj.noOfCopiesAvailable === null || bookObj.noOfCopiesAvailable === ""){
        commonFunctions.changeTextBoxBorderToError((bookObj.noOfCopiesAvailable === undefined || bookObj.noOfCopiesAvailable === null) ? "" : bookObj.noOfCopiesAvailable, "noOfCopiesAvailable");
        errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
        isValid = false;
    }
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
        const {bookObj,bookData} = this.state;
        // if (!this.validateFields()) {
        //     return;
        //   }
        let isValid = this.validateFields(bookObj,bookData);
        if(isValid === false){
            return;
        }
        const bookInput = this.getAddBookInput(bookObj);
        this.doSave(bookInput, id);
}
render(){
const {bookData, isModalOpen,createLibraryDataCache, bookObj, modelHeader, errorMessage, successMessage} = this.state;
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
            //                                 {this.createDepartment(createLibraryDataCache.departments)}
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
            {/* <button className="btn btn-primary mr-1" id="btnUpdateFeeCategory" name="btnUpdateFeeCategory" onClick={this.addBook} style={{ width: '170px' }}>Update Book</button> */}
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
             No Of Copies Available<span style={{ color: 'red' }}> * </span></label>
             <input type="text" 
             required className="gf-form-input fwidth" 
             maxLength={255}  
             onChange={this.onChange}  
             value={bookObj.noOfCopiesAvailable} 
              placeholder="noOfCopiesAvailable" 
              name="noOfCopiesAvailable" 
             id="noOfCopiesAvailable"/>
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
          </div>
        </div>

      </section>
        );
    }
}

export default withApollo(BookGrid);
