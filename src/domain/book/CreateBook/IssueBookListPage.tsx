import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {NavItem,NavLink, TabPane, TabContent} from 'reactstrap';
import { graphql, QueryProps, MutationFunc, compose, withApollo } from "react-apollo";
import {GET_ISSUE_BOOK_LIST, CREATE_LIBRARY_FILTER_DATA_CACHE, ISSUE_BOOK_LIST} from '../_queries';
import withLoadingHandler from '../withLoadingHandler';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import IssueBookDetails from './IssueBookDetails';
import EditBook from './EditBook';
import EditIssueBookPage from './EditIssueBookPage';
import Table from '../../../css/table';


const w180 = {
    width: '180px',
    marginBottom: '5px'
};

type IssueBookTableStates = {
  user:any,
  issueBooks: any,
  issueBookData: any,
  departments: any,
  pageSize: any,
  search: any,
  activeTab: any,
  issueBookObj: any,
  createLibraryDataCache: any,
  branchId: any,
  academicYearId: any,
  departmentId: any,
  batchId: any,
  studentId: any,
  bookId: any,
};

class IssueBookObj {
  id: any;
  strIssueDate: any;
  strDueDate: any;
  bookStatus: any;
  rollNo: any;
  studentName: any;
  noOfCopies: any;
  noOfCopiesAvailable: any;
  name: any;
  batch: any;

 constructor(id: any, strIssueDate: any, strDueDate: any, bookStatus: any, rollNo: any, studentName: any, noOfCopies: any, noOfCopiesAvailable: any, name: any, batch: any ) {
  this.id = id;
  this.strIssueDate = strIssueDate;
  this.strDueDate = strDueDate;
  this.bookStatus = bookStatus;
  this.rollNo = rollNo;
  this.studentName = studentName;
  this.noOfCopies = noOfCopies;
  this.noOfCopiesAvailable = noOfCopiesAvailable;
  this.name = name;
  this.batch = batch;
 }
 }
export interface IssueBookListProps extends React.HTMLAttributes<HTMLElement> {
    [data: string]: any;
    user?: any;
    createLibraryDataCache?: any;
  }

class IssueBookTable<T = {[data: string]: any}> extends React.Component<IssueBookListProps, any> {
  constructor(props: IssueBookListProps) {
    super(props);
    const params = new URLSearchParams(location.search);
    this.state = {
      activeTab: 2,
      issueBookObj: {},
      user: this.props.user,
      createLibraryDataCache: this.props.createLibraryDataCache,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      batchId: null,
      studentId: null,
      bookId: null,
      issueBooks: {},
      issueBookDataList: [],
      issueBookData: {
       department: {
          id: '',
        },
        book: {
          id: '',
          bookTitle:'',
        },
        mutateResult: [],
        search: ""
      },
      departments:"",
      pageSize: 5,
      search: '',
      columns: [
        {
            label: "Book Id",
            key: 'id',
            // isCaseInsensitive: true,
        },
        {
          label: "IssueDate",
          key: 'strIssueDate',
          // isCaseInsensitive: false,
      },
      {
        label: "DueDate",
        key: 'strDueDate',
        // isCaseInsensitive: false,
    },
    {
      label: "Book Status",
      key: 'bookStatus',
      // isCaseInsensitive: false,
    },
    {
      label: "Student RollNo",
      key: 'rollNo',
      // isCaseInsensitive: false,
    },
    {
      label: "Student Name",
      key: 'studentName',
      // isCaseInsensitive: false,
    },
    {
      label: "NoOfCopies",
      key: 'noOfCopies',
      // isCaseInsensitive: false,
    },
    {
      label: "CopiesAvailable",
      key: 'noOfCopiesAvailable',
      // isCaseInsensitive: false,
    },
    {
      label: "Department",
      key: 'name',
      // isCaseInsensitive: false,
    },
    {
      label: "Batch Name",
      key: 'batch',
      // isCaseInsensitive: false,
    },
    {
      label: 'Edit',
      key: 'action',
      renderCallback: (value: any, obj: any) => {
    return <td>
      <div className="d-inline-block">
              <button className="btn btn-primary" onClick={(e: any) => this.editDetails(obj, e)}>
                            {' '} Edit Book {' '}
                        </button>   
      </div>
    </td>
    },
      isCaseInsensitive: true
    },
    {
      label: 'Details',
      key: 'action',
      renderCallback: (value: any, obj: any) => {
    return <td>
      <div className="d-inline-block">
              <button className="btn btn-primary" onClick={(e: any) => this.showDetail(obj, e)}>
                          {' '} Details {' '}
                          </button> 
      </div>
    </td>
    },
      isCaseInsensitive: true
    }
  ],
    };
    this.createBook = this.createBook.bind(this);
    this.createDepartment = this.createDepartment.bind(this);
    this.checkAllBooks = this.checkAllBooks.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
    // this.createIssueBookRows = this.createIssueBookRows.bind(this);
    this.showDetail = this.showDetail.bind(this);
    this.SetObject = this.SetObject.bind(this);
    this.createNoRecordMessage = this.createNoRecordMessage.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.getcreateLibraryFilterDataCache = this.getcreateLibraryFilterDataCache.bind(this);
  }

  async toggleTab(tabNo: any) {
    await this.setState({
      activeTab: tabNo,
    });
  } 
  // async componentDidMount(){
  //   await this.registerSocket();
  //   console.log(
  //     '5. check create catch departments:',
  //     this.state.createLibraryDataCache.departments
  //   );
  // }
  async componentDidMount() {
    console.log("component Did ram")
    const { data } = await this.props.client.query({
      query: ISSUE_BOOK_LIST,
      fetchPolicy: 'no-cache'
    })
  
    const temp = data.getIssueBookList;
    console.log("final Data : ", temp)
    let i;
    let ary = [];
    let obj;
    for (i in temp) {
   obj = new IssueBookObj(temp[i].id, temp[i].strIssueDate, 
    temp[i].strDueDate, temp[i].bookStatus, temp[i].student.rollNo, 
    temp[i].student.studentName, temp[i].book.noOfCopies, 
    temp[i].book.noOfCopiesAvailable, temp[i].department.name,
     temp[i].batch.batch);
  ary.push(obj);
    }
    console.log("final Data ", ary)
    this.setState({
      issueBookDataList: ary
    });
    await this.getIssueBook();
  }
  getIssueBook = async () => {
    const { data } = await this.props.client.query({
      query: GET_ISSUE_BOOK_LIST,
      fetchPolicy: 'no-cache'
    })
    var arr = data.getIssueBookList;
    let i;
    let finalAry = [];
    for (i in arr) {
     let obj = new IssueBookObj(arr[i].id, arr[i].strIssueDate, 
      arr[i].strDueDate, arr[i].bookStatus, arr[i].student.rollNo, 
      arr[i].student.studentName, arr[i].book.noOfCopies, 
      arr[i].book.noOfCopiesAvailable, arr[i].department.name, 
      arr[i].batch.batch);
      finalAry.push(obj);
    }
    console.log("Final Array : ", finalAry);
    this.setState({
      issueBookList: finalAry,
    });

    console.log(" state variable Book data :::", this.state.bookList);
  }
async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
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
        departmentsOptions.push(
        <option key={departments[i].id} value={departments[i].id}>
          {departments[i].id}
        </option>
      );
    }
    return departmentsOptions;
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
          {books[i].id}
        </option>
      );
    }
    return booksOptions;
  }
  checkAllBooks(e: any) {
    const { issueBookData } = this.state;
    const mutateResLength = issueBookData.mutateResult.length;
    let chkAll = e.nativeEvent.target.checked;
    let els = document.querySelectorAll('input[type=checkbox]');

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
    let chkBox: any = document.querySelector('#' + id);
    chkBox.checked = e.nativeEvent.target.checked;
  }
  

  createNoRecordMessage(objAry: any) {
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const issueBooks = tempObj.data.getIssueBookList;
      const length = issueBooks.length;
      if (length === 0) {
        retVal.push(
          <h4 className="ptl-06">No Record Found</h4>
        );
      }
    }
    return retVal;
  }
  
  // createIssueBookRows(objAry: any) {
  //   let { search } = this.state.issueBookData;
  //   search = search.trim();
  //   const mutateResLength = objAry.length;
  //   const retVal = [];
  //   for (let x = 0; x < mutateResLength; x++) {
  //     const tempObj = objAry[x];
  //     const issueBooks = tempObj.data.getIssueBookList;
  //     const length = issueBooks.length;
  //     for (let i = 0; i < length; i++) {
  //       const issueBook = issueBooks[i];
  //       if(search){
  //         if(issueBook.bookTitle.indexOf(search) !== -1){
  //           retVal.push(
  //             <tr key={issueBook.id}>
  //               <td>
  //                 <input onClick={(e: any) => this.onClickCheckbox(i, e)} 
  //                 checked={issueBook.isChecked} 
  //                 type="checkbox" 
  //                 name="chk" 
  //                 id={"chk" + issueBook.id} />
  //               </td>
  //               {/* <td>
  //                   {issueBook.id}</td> */}
                
  //               <td>{issueBook.strIssueDate}</td>
  //               <td>{issueBook.strDueDate}</td>
  //               <td>{issueBook.bookStatus}</td>
  //               <td>{issueBook.student.rollNo}</td>
  //               <td>{issueBook.student.studentName}</td>
  //               <td>{issueBook.book.noOfCopies}</td>
  //               <td>{issueBook.book.noOfCopiesAvailable}</td>
  //               <td>{issueBook.batch.batch}</td>
  //               <td>{issueBook.department.name}</td>
  //               <td>
                    
  //                       <button className="btn btn-primary" 
  //                       onClick={(e: any) => this.showDetails(issueBook, e)}>
  //                           {' '}
  //                           Edit Book{' '}
  //                       </button>
                    
  //               </td>
  //               <td>
                    
  //                       <button className="btn btn-primary" 
  //                       onClick={(e: any) => this.showDetail(issueBook, e)}>
  //                           {' '}
  //                           Details{' '}
  //                           </button> 
  //               </td>
  //             </tr>
  //           );
  //           console.log('print book obj:', issueBook);
  //         }
  //       } else{
  //         retVal.push(
  //           <tr key={issueBook.id}>
  //             <td>
  //               <input onClick={(e: any) => this.onClickCheckbox(i, e)} 
  //               checked={issueBook.isChecked} 
  //               type="checkbox" 
  //               name="chk" 
  //               id={"chk" + issueBook.id} />
  //             </td>
  //             {/* <td>{issueBook.id}</td> */}
              
  //               <td>{issueBook.strIssueDate}</td>
  //               <td>{issueBook.strDueDate}</td>
  //               <td>{issueBook.bookStatus}</td>
  //               <td>{issueBook.student.rollNo}</td>
  //               <td>{issueBook.student.studentName}</td>
  //               <td>{issueBook.book.noOfCopies}</td>
  //               <td>{issueBook.book.noOfCopiesAvailable}</td>
  //               <td>{issueBook.batch.batch}</td>
  //               <td>{issueBook.department.name}</td>
  //               <td>
                    
  //                       <button className="btn btn-primary" 
  //                       onClick={(e: any) => this.showDetails(issueBook, e)}>
  //                           {' '}
  //                           Edit Book{' '}
  //                           </button>
                    
  //               </td>
  //               <td>
                    
  //                       <button className="btn btn-primary" 
  //                       onClick={(e: any) => this.showDetail(issueBook, e)}>
  //                           {' '}
  //                           Details{' '}
  //                           </button>
                    
  //               </td>
  //           </tr>
  //         );
  //         console.log('print issueBook obj:', issueBook);
  //       }
  //     }
  //   }

  //   return retVal;
  // }

  onChange = (e: any) => {
    const { search } = e.nativeEvent.target;
    const { name, value } = e.nativeEvent.target;
    const { issueBookData } = this.state;
    if (name === "book") {
      this.setState({
        issueBookData: {
          ...issueBookData,
          book: {
            id: value
          },
          department:{
            id:""
          }
        }
      });
    } else if (name === "department") {
      this.setState({
        issueBookData: {
          ...issueBookData,
          department: {
            id: value
          },
        }
      });
    } 
    else {
      this.setState({
        issueBookData: {
          ...issueBookData,
          [name]: value
        }
      });
    }
  };
 
  async editDetails(obj: any, e: any) {
    console.log("Edit Obj :: ",obj);
    await this.SetObject(obj);
    console.log('3. data in issueBookObj:', this.state.issueBookObj);
    await this.toggleTab(1);
  }

  async showDetail(obj: any, e: any) {
    console.log("Edit Obj :: ",obj);
    await this.SetObject(obj);
    console.log('3. data in issueBookObj:', this.state.issueBookObj);
    await this.toggleTab(0);
  }

  async SetObject(obj: any) {
    console.log('1. setting object :', obj);
    await this.setState({
        issueBookObj: obj,
    });
    console.log('2. data in obj:', obj);
  }

  onClick = (e: any) => {
    const { name, value } = e.nativeEvent.target;
    const { getIssueBookList } = this.props;
    const { issueBookData, departmentId } = this.state;
    e.preventDefault();
    let issueBookFilterInputObject = {
      bookId: issueBookData.book.id,
      // departmentId: departmentId,
    };
    this.props.client
      .mutate({
        mutation: GET_ISSUE_BOOK_LIST,
        variables: {
          filter: issueBookFilterInputObject,
        },
      })
      .then((data: any) => {
      const ldt = data;
      issueBookData.mutateResult = [];
      issueBookData.mutateResult.push(ldt);
      this.setState({
        issueBookData: issueBookData
      });
      console.log('IssueBook filter mutation result ::::: ', issueBookData.mutateResult);
    }).catch((error: any) => {
      console.log('there was an error sending the query result', error);
      return Promise.reject(`Could not retrieve book data: ${error}`);
    });
  }  



  render() {
    const { createLibraryDataCache, departmentId, issueBookData, activeTab, user, issueBookDataList  } = this.state;
  
    return (
      <section className="customCss">
         <TabContent activeTab={activeTab}>
          <TabPane tabId={2}>
        <div className="container-fluid" style={{padding: '0px'}}>
          <div className="m-b-1 bg-heading-bgStudent studentListFlex">
            <div className="">
              <h4 className="ptl-06">IssueBook Details</h4>
            </div>
          </div>
          <div>
            <div className="student-flex">
            {/* <div>
                <label htmlFor="">Book</label>
                <select
                  required
                  name="book"
                  id="book"
                  onChange={this.onChange}
                  value={issueBookData.book.id}
                  className="gf-form-input max-width-22"
                >
                  {createLibraryDataCache !== null &&
                  createLibraryDataCache !== undefined &&
                  createLibraryDataCache.books !== null &&
                  createLibraryDataCache.books !== undefined
                    ? this.createBook(
                        createLibraryDataCache.books
                      )
                    : null}
                </select>
              </div> */}
              {/* <div>
                <label htmlFor="">Department</label>
                <select
                  required
                  name="department"
                  id="department"
                  onChange={this.onChange}
                  value={bookData.department.id}
                  className="gf-form-input max-width-22"
                >
                  {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.departments !== null &&
                  createLibraryFilterDataCache.departments !== undefined
                    ? this.createBook(
                        createLibraryFilterDataCache.departments
                      )
                    : null}
                </select>
              </div> */}
              {/* <div className="margin-bott max-width-22">
                <label htmlFor="">Book Title</label>
                <input type="text" name="search" value={issueBookData.search} onChange={this.onChange} />
              </div> */}
              {/* <div id="srch" className="margin-bott">
                    <label htmlFor="">Search</label>
                    <input
                      type="text"
                      className="gf-form-input"
                      name="search"
                      value={issueBookData.search}
                      onChange={this.onChange}
                    />
                  </div> */}
            {/* <div className="m-b-1 bg-heading-bg studentSearch"> */}
              {/* <h4 className="ptl-06"></h4> */}
              {/* <button 
              className="btn btn-primary max-width-13" 
              id="btnFind" 
              name="btnFind" 
              onClick={this.onClick} 
              style={w180}>
                  Search IssuedBooks
            </button>
            </div> */}
            </div>
            {/* <table id="Librarylistpage" className="striped-table fwidth bg-white">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" 
                    onClick={(e: any) => this.checkAllBooks(e)} 
                    value="checkedall" 
                    name="" 
                    id="chkCheckedAll" />
                  </th>
                  {/* <th>IssueBook Id</th> */}
                  {/* <th>IssueDate</th>
                  <th>DueDate</th>
                  <th>Book Status</th>
                  <th>Student RollNo</th>
                  <th>Student Name</th>
                  <th>NoOfCopies</th>
                  <th>NoOfCopiesAvailable</th>
                  <th>Batch Name</th>
                  <th>Department</th>
                  <th>Edit</th> 
                  <th>Details</th> 
                </tr>
              </thead>
              <tbody>
                {
                  this.createIssueBookRows(this.state.issueBookData.mutateResult)
                }
              </tbody>
            </table> */} 
            <Table valueFromData={{ columns: this.state.columns, data: issueBookDataList }} perPageLimit={6} visiblecheckboxStatus={true} tableClasses={{ table: "alert-data-tabel", tableParent: "alerts-data-tabel", parentClass: "all-alert-data-table" }} searchKey="name" showingLine="Showing %start% to %end% of %total%" />
            {
              this.createNoRecordMessage(this.state.issueBookData.mutateResult)
            } 
          </div>
        </div>
        </TabPane>
        <TabPane tabId={0}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Issue Book Details</h4>
                </div>
                <div className="">
                  <a
                     className="btn btn-primary m-l-1  pull-right"
                    onClick={() => {
                      this.toggleTab(2);
                    }}
                  >
                    Back
                  </a>
                  <a
                    className="btn btn-primary m-l-1  pull-right"
                    onClick={(e: any) => {
                      print();
                    }}
                  >
                    Print
                  </a>
                </div>
              </div>
              {this.state.issueBookObj !== null && 
              this.state.issueBookObj !== undefined && (
                <IssueBookDetails data={this.state.issueBookObj} />
              )}
            </div>
          </TabPane>
          <TabPane tabId={1}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Edit IssueBook </h4>
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
                this.state.issueBookObj !== null &&
                this.state.issueBookObj !== undefined && (
                  <EditIssueBookPage
                    user={user}
                    data={this.state.issueBookObj}
                    issueBookObj={this.state.issueBookObj}
                    departments={this.state.createLibraryDataCache.departments}
                    students={this.state.createLibraryDataCache.students}
                    books={this.state.createLibraryDataCache.books}
                    batches={this.state.createLibraryDataCache.batches}/>
                )}
            </div>
          </TabPane>
        </TabContent>
      </section>
    );
  }
}
export default withApollo(IssueBookTable);