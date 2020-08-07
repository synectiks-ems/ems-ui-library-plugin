import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {NavItem,NavLink, TabPane, TabContent} from 'reactstrap';
import { graphql, QueryProps, MutationFunc, compose, withApollo } from "react-apollo";
import {GET_BOOK_LIST} from '../_queries';
import withLoadingHandler from '../withLoadingHandler';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import LibraryDetails from './LibraryDetails';
import EditLibrary from './EditLibrary';
// import EditLibrary from './EditLibrary';

const w180 = {
    width: '180px',
    marginBottom: '5px'
};

type LibraryTableStates = {
  user:any,
  libraries: any,
  libData: any,
  departments: any,
  pageSize: any,
  search: any,
  activeTab: any,
  lbObj: any,
  createLibraryFilterDataCache: any,
  branchId: any,
  academicYearId: any,
  departmentId: any,
};


export interface LibraryListProps extends React.HTMLAttributes<HTMLElement> {
    [data: string]: any;
    createLibraryFilterDataCache?: any;
  }

class LibraryTable<T = {[data: string]: any}> extends React.Component<LibraryListProps, LibraryTableStates> {
  constructor(props: LibraryListProps) {
    super(props);
    this.state = {
      activeTab: 2,
      lbObj: {},
      user: this.props.user,
      createLibraryFilterDataCache: this.props.createLibraryFilterDataCache,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      libraries: {},
      libData: {
       department: {
          id: ""
        },
        library: {
          id: ""
        },
        mutateResult: [],
        search: ""
      },
      departments:"",
      pageSize: 5,
      search: ''

    };
    this.createLibrary = this.createLibrary.bind(this);
    this.createDepartment = this.createDepartment.bind(this);
    this.checkAllLibraries = this.checkAllLibraries.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
    this.createLibraryRows = this.createLibraryRows.bind(this);
    this.createNoRecordMessage = this.createNoRecordMessage.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
  }
    
  async componentDidMount(){
    await this.registerSocket();
  }
  
  async toggleTab(tabNo: any) {
    await this.setState({
      activeTab: tabNo,
    });
  }
  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
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
          {departments[i].id}
        </option>
      );
    }
    return departmentsOptions;
  }

  
  createLibrary(libraries: any) {
    let librariesOptions = [
      <option key={0} value="">
        Select Library
      </option>,
    ];
    for (let i = 0; i < libraries.length; i++) {
        librariesOptions.push(
        <option key={libraries[i].id} value={libraries[i].id}>
          {libraries[i].id}
        </option>
      );
    }
    return librariesOptions;
  }

  checkAllLibraries(e: any) {
    const { libData } = this.state;
    const mutateResLength = libData.mutateResult.length;
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
  createNoRecordMessage(objAry: any) {
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const libraries = tempObj.data.getLibraryList;
      const length = libraries.length;
      if (length === 0) {
        retVal.push(
          <h4 className="ptl-06">No Record Found</h4>
        );
      }
    }
    return retVal;
  }
  async showDetails(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in lbObj:', this.state.lbObj);
    await this.toggleTab(1);
  }

  async showDetail(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in lbObj:', this.state.lbObj);
    await this.toggleTab(0);
  }

  async SetObject(obj: any) {
    console.log('1. setting object :', obj);
    await this.setState({
      lbObj: obj,
    });
    console.log('2. data in obj:', obj);
  }

  createLibraryRows(objAry: any) {
    let { search } = this.state.libData;
    search = search.trim();
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const libraries = tempObj.data.getLibraryList;
      const length = libraries.length;
      for (let i = 0; i < length; i++) {
        const library = libraries[i];
        if(search){
          if(library.bookTitle.indexOf(search) !== -1){
            retVal.push(
              <tr key={library.id}>
                <td>
                  <input onClick={(e: any) => this.onClickCheckbox(i, e)} 
                  checked={library.isChecked} 
                  type="checkbox" 
                  name="chk" 
                  id={"chk" + library.id} />
                </td>
                <td>{library.id}</td>
                <td>
                {/* <a onClick={(e: any) => this.showDetail(library, e)}
                  style={{color: '#307dc2'}}>
                  {library.bookNo}
                </a> */}
                {library.bookNo}
              </td>
                <td>{library.clNo}</td>
                <td>{library.bookTitle}</td>
                <td>{library.author}</td>
                <td>{library.noOfCopies}</td>
                <td>{library.department.name}</td>
                <td>
                    {
                        <button className="btn btn-primary" onClick={(e: any) => this.showDetails(library, e)}>Edit</button>
                    }
                </td>
                <td>
                    {
                        <button className="btn btn-primary" onClick={(e: any) => this.showDetail(library, e)}>Details</button>
                    }
                </td>
              </tr>
            );
            console.log('print library obj:', library);
          }
        } else{
          retVal.push(
            <tr key={library.id}>
              <td>
                <input onClick={(e: any) => this.onClickCheckbox(i, e)} 
                checked={library.isChecked} 
                type="checkbox" 
                name="chk" 
                id={"chk" + library.id} />
              </td>
              <td>{library.id}</td>
              <td>
              {/* <a onClick={(e: any) => this.showDetail(library, e)}
              style={{color: '#307dc2'}}>
                  {library.bookNo}
                </a> */}
                {library.bookNo}
               </td>
               <td>{library.clNo}</td>
               <td>{library.bookTitle}</td>
               <td>{library.author}</td>
               <td>{library.noOfCopies}</td>
               <td>{library.department.name}</td>
                <td>
                    {
                        <button className="btn btn-primary" onClick={(e: any) => this.showDetails(library, e)}>Edit</button>
                    }
                </td>
                <td>
                    {
                        <button className="btn btn-primary" onClick={(e: any) => this.showDetail(library, e)}>Details</button>
                    }
                </td>
            </tr>
          );
          console.log('print library obj:', library);
        }
      }
    }

    return retVal;
  }

  onChange = (e: any) => {
    const { search } = e.nativeEvent.target;
    const { name, value } = e.nativeEvent.target;
    const { libData } = this.state;
    if (name === "library") {
      this.setState({
        libData: {
          ...libData,
          library: {
            id: value
          },
          department:{
            id:""
          }
        }
      });
    } else if (name === "department") {
      this.setState({
        libData: {
          ...libData,
          department: {
            id: value
          },
        }
      });
    } 
    else {
      this.setState({
        libData: {
          ...libData,
          [name]: value
        }
      });
    }
  }
 

  onClick = (e: any) => {
    const { name, value } = e.nativeEvent.target;
    const { getLibraryList } = this.props;
    const { libData } = this.state;
    e.preventDefault();
    let libraryFilterInputObject = {
      libraryId: libData.library.id,
      departmentId: libData.department.id,
    };
    this.props.client
      .mutate({
        mutation: GET_BOOK_LIST,
        variables: {
          filter: libraryFilterInputObject,
        },
      })
      .then((data: any) => {
      const ldt = data;
      libData.mutateResult = [];
      libData.mutateResult.push(ldt);
      this.setState({
        libData: libData
      });
      console.log('Library filter mutation result ::::: ', libData.mutateResult);
    }).catch((error: any) => {
      console.log('there was an error sending the query result', error);
      return Promise.reject(`Could not retrieve library data: ${error}`);
    });
  }

  render() {
    const { createLibraryFilterDataCache, libData, activeTab, user,  }= this.state;
  
    return (
      <section className="customCss">
         <TabContent activeTab={activeTab}>
          <TabPane tabId={2}>
        <div className="container-fluid" style={{padding: '0px'}}>
          <div className="m-b-1 bg-heading-bgStudent studentListFlex">
            <div className="">
              <h4 className="ptl-06">Library Details</h4>
            </div>
          </div>
          <div>
            <div className="student-flex">
            <div>
                <label htmlFor="">Library</label>
                <select
                  required
                  name="library"
                  id="library"
                  onChange={this.onChange}
                  value={libData.library.id}
                  className="gf-form-input max-width-22"
                >
                  {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.libraries !== null &&
                  createLibraryFilterDataCache.libraries !== undefined
                    ? this.createLibrary(
                        createLibraryFilterDataCache.libraries
                      )
                    : null}
                </select>
              </div>
              {/* <div>
                <label htmlFor="">Department</label>
                <select
                  required
                  name="department"
                  id="department"
                  onChange={this.onChange}
                  value={libData.department.id}
                  className="gf-form-input max-width-22"
                >
                  {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.departments !== null &&
                  createLibraryFilterDataCache.departments !== undefined
                    ? this.createLibrary(
                        createLibraryFilterDataCache.departments
                      )
                    : null}
                </select>
              </div> */}
              <div className="margin-bott max-width-22">
                <label htmlFor="">Book Title</label>
                <input type="text" name="search" value={libData.search} onChange={this.onChange} />
              </div>
            <div className="m-b-1 bg-heading-bg studentSearch">
              {/* <h4 className="ptl-06"></h4> */}
              <button className="btn btn-primary max-width-13" id="btnFind" name="btnFind" onClick={this.onClick} style={w180}>Search Libraries</button>
            </div>
            </div>
            <table id="Librarylistpage" className="striped-table fwidth bg-white">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" onClick={(e: any) => this.checkAllLibraries(e)} value="checkedall" name="" id="chkCheckedAll" />
                  </th>
                  <th>Library Id</th>
                  <th>Book No</th>
                  <th>Row Name</th>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>NoOfCopies</th>
                  <th>Department</th>
                  <th>Edit</th> 
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.createLibraryRows(this.state.libData.mutateResult)
                }
              </tbody>
            </table>
            {
              this.createNoRecordMessage(this.state.libData.mutateResult)
            }
          </div>
        </div>
        </TabPane>
        <TabPane tabId={0}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Book Details</h4>
                </div>
                <div className="">
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={() => {
                      this.toggleTab(2);
                    }}
                  >
                    Back
                  </a>
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={(e: any) => {
                      print();
                    }}
                  >
                    Print
                  </a>
                </div>
              </div>
              {this.state.lbObj !== null && this.state.lbObj !== undefined && (
                <LibraryDetails data={this.state.lbObj} />
              )}
            </div>
          </TabPane>
          <TabPane tabId={1}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Edit Book </h4>
                </div>
                <div className="">
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={() => {
                      this.toggleTab(2);
                    }}
                  >
                    Back
                  </a>
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={(e: any) => {
                      print();
                    }}
                  >
                    Print
                  </a>
                </div>
              </div>
              {user !== null &&
                this.state.lbObj !== null &&
                this.state.lbObj !== undefined && (
                  <EditLibrary
                    user={user}
                    data={this.state.lbObj}
                    bObj={this.state.lbObj}
                    departments={this.state.createLibraryFilterDataCache.departments}/>
                )}
            </div>
          </TabPane>
        </TabContent>
      </section>
    );
  }
}
export default withApollo(LibraryTable);