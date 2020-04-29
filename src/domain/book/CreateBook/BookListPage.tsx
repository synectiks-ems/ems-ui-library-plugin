import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {NavItem,NavLink, TabPane, TabContent} from 'reactstrap';
import { graphql, QueryProps, MutationFunc, compose, withApollo } from "react-apollo";
import {GET_BOOK_LIST} from '../_queries';
import withLoadingHandler from '../withLoadingHandler';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';

const w180 = {
    width: '180px',
    marginBottom: '5px'
};

type BookTableStates = {
  user:any,
  books: any,
  bookData: any,
  students: any,
  pageSize: any,
  search: any,
  activeTab: any,
  bObj: any,
  createLibraryFilterDataCache: any,
  branchId: any,
  academicYearId: any,
  departmentId: any,
};


export interface BookListProps extends React.HTMLAttributes<HTMLElement> {
    [data: string]: any;
    createLibraryFilterDataCache?: any;
  }

class BookTable<T = {[data: string]: any}> extends React.Component<BookListProps, BookTableStates> {
  constructor(props: BookListProps) {
    super(props);
    this.state = {
      activeTab: 3,
      bObj: {},
      user: this.props.user,
      createLibraryFilterDataCache: this.props.createLibraryFilterDataCache,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      books: {},
      bookData: {
       book: {
          id: ""
        },
        student: {
          id: ""
        },
        mutateResult: [],
        search: ""
      },
      students:"",
      pageSize: 5,
      search: ''

    };
    this.createStudent = this.createStudent.bind(this);
    this.createBook = this.createBook.bind(this);
    this.checkAllBooks = this.checkAllBooks.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
    this.createBookRows = this.createBookRows.bind(this);
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

    socket.onmessage = (response: any) => {
        let message = JSON.parse(response.data);
        console.log("Book Index. message received from server ::: ", message);
        this.setState({
            branchId: message.selectedBranchId,
            academicYearId: message.selectedAcademicYearId,
            departmentId: message.selectedDepartmentId,
        });
        console.log("Book Index. branchId: ",this.state.branchId);
        console.log("Book Index. departmentId: ",this.state.departmentId);  
        console.log("Book Index. ayId: ",this.state.academicYearId);  
    }

    socket.onopen = () => {
        console.log("Book Index. Opening websocekt connection to cmsbackend. User : ",this.state.user.login);
        socket.send(this.state.user.login);
    }

    window.onbeforeunload = () => {
        console.log("Book. Closing websocket connection with cms backend service");
    }
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

  
  createStudent(students: any) {
    let studentsOptions = [
      <option key={0} value="">
        Select Student
      </option>,
    ];
    for (let i = 0; i < students.length; i++) {
        studentsOptions.push(
        <option key={students[i].id} value={students[i].id}>
          {students[i].id}
        </option>
      );
    }
    return studentsOptions;
  }

  checkAllBooks(e: any) {
    const { bookData } = this.state;
    const mutateResLength = bookData.mutateResult.length;
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
      const books = tempObj.data.getBookList;
      const length = books.length;
      if (length === 0) {
        retVal.push(
          <h4 className="ptl-06">No Record Found</h4>
        );
      }
    }
    return retVal;
  }


  async showDetail(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in lbObj:', this.state.bObj);
    await this.toggleTab(1);
  }

  async SetObject(obj: any) {
    console.log('1. setting object :', obj);
    await this.setState({
    bObj: obj,
    });
    console.log('2. data in obj:', obj);
  }

  createBookRows(objAry: any) {
    let { search } = this.state.bookData;
    search = search.trim();
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const books = tempObj.data.getBookList;
      const length = books.length;
      for (let i = 0; i < length; i++) {
        const book = books[i];
        if(search){
        //   if(book.bookTitle.indexOf(search) !== -1){
            retVal.push(
              <tr key={book.id}>
                <td>
                  <input onClick={(e: any) => this.onClickCheckbox(i, e)} 
                  checked={book.isChecked} 
                  type="checkbox" 
                  name="chk" 
                  id={"chk" + book.id} />
                </td>
                <td>{book.id}</td>
                <td>
                <a onClick={(e: any) => this.showDetail(book, e)} style={{color: '#307dc2'}}>
                  {book.student.rollNo}
                </a>
              </td>
                <td>{book.student.studentName}</td>
                <td>{book.strIssueDate}</td>
                <td>{book.strDueDate}</td>
                <td>{book.noOfCopiesAvailable}</td>
                <td>{book.department.name}</td>
                <td>{book.batch.batch}</td>
                <td>{book.library.bookTitle}</td>
                <td>{book.library.bookNo}</td>
                {/* <td>{book.library.author}</td> */}
                <td>{book.bookStatus}</td>
                <td>
                    {
                        <button className="btn btn-primary" onClick={e => this.showDetail(e, true)}>Edit</button>
                    }
                </td>
              </tr>
            );
            console.log('print book obj:', book);
          }
        // } 
        else{
          retVal.push(
            <tr key={book.id}>
              <td>
              <input onClick={(e: any) => this.onClickCheckbox(i, e)} 
                  checked={book.isChecked} 
                  type="checkbox" 
                  name="chk" 
                  id={"chk" + book.id} />
                </td>
                <td>{book.id}</td>
                <td>
                <a onClick={(e: any) => this.showDetail(book, e)} style={{color: '#307dc2'}}>
                  {book.student.rollNo}
                </a>
              </td>
                <td>{book.student.studentName}</td>
                <td>{book.strIssueDate}</td>
                <td>{book.strDueDate}</td>
                <td>{book.noOfCopiesAvailable}</td>
                <td>{book.department.name}</td>
                <td>{book.batch.batch}</td>
                <td>{book.library.bookTitle}</td>
                <td>{book.library.bookNo}</td>
                {/* <td>{book.library.author}</td> */}
                <td>{book.bookStatus}</td>
                <td>
                    {
                        <button className="btn btn-primary" onClick={e => this.showDetail(e, true)}>Edit</button>
                    }
                </td>
            </tr>
          );
          console.log('print book obj:', book);
        }
      }
    }

    return retVal;
  }

  onChange = (e: any) => {
    const { search } = e.nativeEvent.target;
    const { name, value } = e.nativeEvent.target;
    const { bookData } = this.state;
    if (name === "book") {
      this.setState({
        bookData: {
          ...bookData,
          book: {
            id: value
          },
          student:{
            id:""
          }
        }
      });
    } else if (name === "student") {
      this.setState({
        bookData: {
          ...bookData,
          student: {
            id: value
          },
        }
      });
    } 
    else {
      this.setState({
        bookData: {
          ...bookData,
          [name]: value
        }
      });
    }
  }
 

  onClick = (e: any) => {
    const { name, value } = e.nativeEvent.target;
    const { getBookList } = this.props;
    const { bookData } = this.state;
    e.preventDefault();
    let bookFilterInputObject = {
      bookId: bookData.book.id,
      studentId: bookData.student.id,
    };
    this.props.client
      .mutate({
        mutation: GET_BOOK_LIST,
        variables: {
          filter: bookFilterInputObject,
        },
      })
      .then((data: any) => {
      const vdt = data;
      bookData.mutateResult = [];
      bookData.mutateResult.push(vdt);
      this.setState({
        bookData: bookData
      });
      console.log('Book filter mutation result ::::: ', bookData.mutateResult);
    }).catch((error: any) => {
      console.log('there was an error sending the query result', error);
      return Promise.reject(`Could not retrieve book data: ${error}`);
    });

  }

  render() {
    const { createLibraryFilterDataCache, bookData, activeTab, user,  }= this.state;
  
    return (
      <section className="customCss">
         <TabContent activeTab={activeTab}>
          <TabPane tabId={3}>
        <div className="container-fluid p-1 ">
          <div className="m-b-1 bg-heading-bgStudent studentListFlex">
            <div className="">
              <h4 className="ptl-06">Book Details</h4>
            </div>
          </div>
          <div>
            <div className="student-flex">
            <div>
                <label htmlFor="">Book</label>
                <select
                  required
                  name="book"
                  id="book"
                  onChange={this.onChange}
                  value={bookData.book.id}
                  className="gf-form-input max-width-22"
                >
                  {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.books !== null &&
                  createLibraryFilterDataCache.books !== undefined
                    ? this.createBook(
                        createLibraryFilterDataCache.books
                      )
                    : null}
                </select>
              </div>
              <div>
                <label htmlFor="">Student</label>
                <select
                  required
                  name="student"
                  id="student"
                  onChange={this.onChange}
                  value={bookData.student.id}
                  className="gf-form-input max-width-22"
                >
                  {createLibraryFilterDataCache !== null &&
                  createLibraryFilterDataCache !== undefined &&
                  createLibraryFilterDataCache.students !== null &&
                  createLibraryFilterDataCache.students !== undefined
                    ? this.createStudent(
                        createLibraryFilterDataCache.students
                      )
                    : null}
                </select>
              </div>
              {/* <div className="margin-bott max-width-22">
                <label htmlFor="">Book Title</label>
                <input type="text" name="search" value={bookData.search} onChange={this.onChange} />
              </div> */}
            <div className="m-b-1 bg-heading-bg studentSearch">
              {/* <h4 className="ptl-06"></h4> */}
              <button className="btn btn-primary max-width-13" id="btnFind" name="btnFind" onClick={this.onClick} style={w180}>Search books</button>
            </div>
            </div>
            <table id="Booklistpage" className="striped-table fwidth bg-white">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" onClick={(e: any) => this.checkAllBooks(e)} value="checkedall" name="" id="chkCheckedAll" />
                  </th>
                  <th>Book Id</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Issue  Date</th>
                  <th>Due  Date</th>
                  <th>No Of Copies Available </th>
                  <th>Department Name</th>
                  <th>Year</th>
                  <th>Book Title</th>
                  <th>Book No</th>
                  {/* <th>Author</th> */}
                  <th>Book Status</th>
                  <th>Edit</th> 
                </tr>
              </thead>
              <tbody>
                {
                  this.createBookRows(this.state.bookData.mutateResult)
                }
              </tbody>
            </table>
            {
              this.createNoRecordMessage(this.state.bookData.mutateResult)
            }
          </div>
        </div>
        </TabPane>
        {/* <TabPane tabId={1}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">L Details</h4>
                </div>
                <div className="">
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={() => {
                      this.toggleTab(4);
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
              {this.state.vObj !== null && this.state.vObj !== undefined && (
                <VehicleDetails data={this.state.vObj} />
              )}
            </div>
          </TabPane> */}
        </TabContent>
      </section>

    );
  }
}
export default withApollo(BookTable);