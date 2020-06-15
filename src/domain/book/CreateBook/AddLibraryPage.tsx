import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { commonFunctions } from '../../_utilites/common.functions';
import  "../../../css/custom.css";
import '../../../css/college-settings.css';
import '../../../css/tabs.css'; 
import {MessageBox} from '../../Message/MessageBox'
import { withApollo } from 'react-apollo';
import * as moment from 'moment';
import { ADD_LIBRARY } from "./../_queries";
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';


export interface LibraryProps extends React.HTMLAttributes<HTMLElement>{
    [data: string]: any;
    lbList?: any;
    libData?:any;
    user?:any;
    createLibraryFilterDataCache: null,
    departments: any;
}

const ERROR_MESSAGE_MANDATORY_FIELD_MISSING = "Mandatory fields missing";
const ERROR_MESSAGE_SERVER_SIDE_ERROR = "Due to some error in library service, library could not be saved. Please check vehicle service logs";
const SUCCESS_MESSAGE_LIBRARY_ADDED = "New library saved successfully";
const SUCCESS_MESSAGE_LIBRARY_UPDATED = "library  updated successfully";

class LibraryGrid<T = {[data: string]: any}> extends React.Component<LibraryProps, any> {
    constructor(props: LibraryProps) {
         super(props);
        this.state = {
            lbList: this.props.lbList,
            user:this.props.user,
            createLibraryFilterDataCache: this.props.createLibraryFilterDataCache,
            errorMessage: "",
            successMessage: "",
            lbObj: {
              clNo:"",
              bookTitle:"",
              bookNo:"",
              author:"",
              noOfCopies:"",
              uniqueNo:"",
              departmentId:""
            },
            libData:{
                department:{
                    id:''
                }
            },
            departments: [],
        };
        this.createDepartment = this.createDepartment.bind(this);   
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
        const { lbObj,libData } = this.state;
        
    if (name === 'department') {
        this.setState({
          libData: {
            ...libData,
            department: {
              id: value,
            },
          },
        });
      } 
      else{
        this.setState({
            lbObj: {
                ...lbObj,
                [name]: value
            },
            libData: {
                ...libData,
                [name]: value,
              },
            errorMessage: "",
            successMessage: "",
        });
    }
        commonFunctions.restoreTextBoxBorderToNormal(name);
    }

    getAddLibraryInput(lbObj: any){
        const{libData}=this.state;
        let id = null;
        // if(modelHeader === "Edit Library"){
        //     id = lbObj.id;
        // }
        let lbInput = {
            id: id,
            clNo: lbObj.clNo,
            bookTitle: lbObj.bookTitle,
            bookNo: lbObj.bookNo,
            author: lbObj.author,
            noOfCopies: lbObj.noOfCopies,
            uniqueNo: lbObj.uniqueNo,
            departmentId: libData.department.id,
        };
        return lbInput;
    }

    validateFields(lbObj: any,libData: any){
      let isValid = true;
      let errorMessage = ""
      if(lbObj.clNo === undefined || lbObj.clNo === null || lbObj.clNo === ""){
          commonFunctions.changeTextBoxBorderToError((lbObj.clNo === undefined || lbObj.clNo === null) ? "" : lbObj.clNo, "clNo");
          errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
          isValid = false;
      }
      if(lbObj.bookTitle === undefined || lbObj.bookTitle === null || lbObj.bookTitle === ""){
          commonFunctions.changeTextBoxBorderToError((lbObj.bookTitle === undefined || lbObj.bookTitle === null) ? "" : lbObj.bookTitle , "bookTitle");
          errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
          isValid = false;
      }
      if(lbObj.noOfCopies === undefined || lbObj.noOfCopies === null || lbObj.noOfCopies === ""){
          commonFunctions.changeTextBoxBorderToError((lbObj.noOfCopies === undefined || lbObj.noOfCopies === null) ? "" : lbObj.noOfCopies, "noOfCopies");
          errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
          isValid = false;
      }
      if(libData.department.id === undefined || libData.department.id === null || libData.department.id === ""){
        commonFunctions.changeTextBoxBorderToError((libData.department.id === undefined || libData.department.id === null) ? "" : libData.department.id, "department");
        errorMessage = ERROR_MESSAGE_MANDATORY_FIELD_MISSING;
        isValid = false;
    }
    this.setState({
        errorMessage: errorMessage
    });
    return isValid; 
    }

    async doSave(lbInput: any, id: any){
      let btn = document.querySelector("#"+id);
      btn && btn.setAttribute("disabled", "true");
      let exitCode = 0;

      await this.props.client.mutate({
          mutation: ADD_LIBRARY,
          variables: { 
              input: lbInput
          },
      }).then((resp: any) => {
          console.log("Success in addLibrary Mutation. Exit code : ",resp.data.addLibrary.cmsLibraryVo.exitCode);
          exitCode = resp.data.addLibrary.cmsLibraryVo.exitCode;
          let temp = resp.data.addLibrary.cmsLibraryVo.dataList; 
          console.log("New Library list : ", temp);
          this.setState({
              lbList: temp
          });
      }).catch((error: any) => {
          exitCode = 1;
          console.log('Error in addLibrary : ', error);
      });
      btn && btn.removeAttribute("disabled"); 
      let errorMessage = "";
      let successMessage = "";
      if(exitCode === 0 ){
          successMessage = SUCCESS_MESSAGE_LIBRARY_ADDED;
          if(lbInput.id !==null){
              successMessage = SUCCESS_MESSAGE_LIBRARY_UPDATED;
          }
      }else {
          errorMessage = ERROR_MESSAGE_SERVER_SIDE_ERROR;
      }
      this.setState({
          successMessage: successMessage,
          errorMessage: errorMessage
      });
  }
  addLibrary = (e: any) => {
        const { id } = e.nativeEvent.target;
        const {lbObj,libData} = this.state;
        // if (!this.validateFields()) {
        //     return;
        //   }
        let isValid = this.validateFields(lbObj,libData);
        if(isValid === false){
            return;
        }
        const lbInput = this.getAddLibraryInput(lbObj);
        this.doSave(lbInput, id);
}
render(){
const {libData, isModalOpen,createLibraryFilterDataCache, lbObj, modelHeader, errorMessage, successMessage} = this.state;
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
          <h5 className="mtf-8 dark-gray">Library Managementt</h5>
        </div>
        <div id="headerRowDiv" className="b-1 h5-fee-bg j-between">
          <div className="m-1 fwidth">Add Book Data</div>
          <div id="saveLibraryCatDiv" className="fee-flex">
            <button className="btn btn-primary mr-1" id="btnSaveFeeCategory" name="btnSaveFeeCategory" onClick={this.addLibrary} style={{ width: '140px' }}>Add Book</button>
            {/* <button className="btn btn-primary mr-1" id="btnUpdateFeeCategory" name="btnUpdateFeeCategory" onClick={this.addLibrary} style={{ width: '170px' }}>Update Book</button> */}
          </div>
        </div>
        <div id="feeCategoryDiv" className="b-1">
         <div className="b1 row m-1 j-between">
           <div>
            <label className="gf-form-label b-0 bg-transparent">Row Name <span style={{ color: 'red' }}> * </span></label>
            <input type="text" required className="fwidth" style={{ width: '250px' }} onChange={this.onChange}  value={lbObj.clNo} placeholder="clNo" name="clNo" id="clNo"/>
           </div>
           <div>
             <label className="gf-form-label b-0 bg-transparent">Book Title<span style={{ color: 'red' }}> * </span></label>
             <input type="text" required className="fwidth" style={{ width: '250px' }} onChange={this.onChange}  value={lbObj.bookTitle} placeholder="bookTitle" name="bookTitle" id="bookTitle"/>
           </div>
           <div>
             <label className="gf-form-label b-0 bg-transparent">Book No</label>
             <input type="text"  className="fwidth" style={{ width: '250px' }} onChange={this.onChange}  value={lbObj.bookNo} placeholder="bookNo" name="bookNo" id="bookNo"/>
           </div>
           <div>
             <label className="gf-form-label b-0 bg-transparent">Author</label>
             <input type="text"  className="fwidth" style={{ width: '250px' }} onChange={this.onChange}  value={lbObj.author} placeholder="author" name="author" id="author"/>
           </div>
           <div>
             <label className="gf-form-label b-0 bg-transparent">No Of Copies<span style={{ color: 'red' }}> * </span></label>
             <input type="text" required className="fwidth" style={{ width: '250px' }} onChange={this.onChange}  value={lbObj.noOfCopies} placeholder="noOfCopies" name="noOfCopies" id="noOfCopies"/>
           </div>
           <div>
             <label className="gf-form-label b-0 bg-transparent">Unique No</label>
             <input type="text"  className="fwidth" style={{ width: '250px' }} onChange={this.onChange}  value={lbObj.uniqueNo} placeholder="uniqueNo" name="uniqueNo" id="uniqueNo"/>
           </div>
           <div>
             <label className="gf-form-label b-0 bg-transparent">Department<span style={{ color: 'red' }}> * </span></label>
              <select name="department" id="department" onChange={this.onChange}  value={libData.department.id} className="fwidth" style={{ width: '250px' }}>
                {/* {this.createDepartment(createLibraryFilterDataCache.departments)} */}
                {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.departments !== null &&
                  createLibraryFilterDataCache.departments !== undefined
                    ? this.createDepartment(
                        createLibraryFilterDataCache.departments
                      )
                    : null}
              </select>
            </div>
          </div>
        </div>
        {/* <div id="LibraryGrid" className="b-1">
          <table className="fwidth" id="Librarytable">
            <thead >
             <tr>
              <th>Id</th>
              <th>clNo</th>
              <th>bookTitle</th>
              <th>bookNo</th>
              <th>author</th>
              <th>noOfCopies</th>
              <th>Edit</th>
             </tr>
            </thead>
            <tbody>
               { this.createRows(lbList) }
            </tbody>
          </table>
        </div> */}
      </section>
        );
    }
}

export default withApollo(LibraryGrid);