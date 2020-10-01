import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {NavItem,NavLink, TabPane, TabContent} from 'reactstrap';
import { graphql, QueryProps, MutationFunc, compose, withApollo } from "react-apollo";
import {GET_BOOK_LIST,CREATE_LIBRARY_FILTER_DATA_CACHE} from '../_queries';
import withLoadingHandler from '../withLoadingHandler';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import BookDetails from './BooksDetails';
import EditBook from './EditBook';

const w180 = {
    width: '180px',
    marginBottom: '5px'
};

type BookTableStates = {
  user:any,
  books: any,
  bookData: any,
  departments: any,
  pageSize: any,
  search: any,
  activeTab: any,
  bookobj: any,
  createLibraryDataCache: any,
  branchId: any,
  academicYearId: any,
  departmentId: any,
};


export interface BookListProps extends React.HTMLAttributes<HTMLElement> {
    [data: string]: any;
    user?: any;
    createLibraryDataCache?: any;
  }

class BookTable<T = {[data: string]: any}> extends React.Component<BookListProps, BookTableStates> {
  constructor(props: any) {
    super(props);
    const params = new URLSearchParams(location.search);
    this.state = {
      activeTab: 2,
      bookobj: {},
      user: this.props.user,
      createLibraryDataCache: this.props.createLibraryDataCache,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      books: {},
      bookData: {
       department: {
          id: '',
        },
        book: {
          id: '',
        },
        mutateResult: [],
        search: ""
      },
      departments:"",
      pageSize: 5,
      search: ''

    };
    this.createBook = this.createBook.bind(this);
    this.createDepartment = this.createDepartment.bind(this);
    this.checkAllBooks = this.checkAllBooks.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
    this.createBookRows = this.createBookRows.bind(this);
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
  async componentDidMount(){
    await this.registerSocket();
    console.log(
      '5. check create catch departments:',
      this.state.createLibraryDataCache.departments
    );
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
    const { bookData } = this.state;
    const mutateResLength = bookData.mutateResult.length;
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
          if(book.bookTitle.indexOf(search) !== -1){
            retVal.push(
              <tr key={book.id}>
                <td>
                  <input onClick={(e: any) => this.onClickCheckbox(i, e)} 
                  checked={book.isChecked} 
                  type="checkbox" 
                  name="chk" 
                  id={"chk" + book.id} />
                </td>
                <td>
                    {book.id}</td>
                {/* <td> */}
                {/* <a onClick={(e: any) => this.showDetail(book, e)}
                  style={{color: '#307dc2'}}>
                  {book.bookNo}
                </a> */}
                {/* {book.bookNo}
              </td> */}
                <td>{book.shelfNo}</td>
                <td>{book.bookTitle}</td>
                <td>{book.author}</td>
                <td>{book.edition}</td>
                <td>{book.publisher}</td>
                <td>{book.isbNo}</td>
                <td>{book.noOfCopies}</td>
                <td>{book.noOfCopiesAvailable}</td>
                <td>{book.department.name}</td>
                <td>
                    
                        <button className="btn btn-primary" 
                        onClick={(e: any) => this.showDetails(book, e)}>
                            {' '}
                            Edit Book{' '}
                        </button>
                    
                </td>
                <td>
                    
                        <button className="btn btn-primary" 
                        onClick={(e: any) => this.showDetail(book, e)}>
                            {' '}
                            Details{' '}
                            </button> 
                </td>
              </tr>
            );
            console.log('print book obj:', book);
          }
        } else{
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
              {/* <td> */}
              {/* <a onClick={(e: any) => this.showDetail(book, e)}
              style={{color: '#307dc2'}}>
                  {book.bookNo}
                </a> */}
                {/* {book.bookNo}
               </td> */}
                <td>{book.shelfNo}</td>
                <td>{book.bookTitle}</td>
                <td>{book.author}</td>
                <td>{book.edition}</td>
                <td>{book.publisher}</td>
                <td>{book.isbNo}</td>
                <td>{book.noOfCopies}</td>
                <td>{book.noOfCopiesAvailable}</td>
                <td>{book.department.name}</td>
                <td>
                    
                        <button className="btn btn-primary" 
                        onClick={(e: any) => this.showDetails(book, e)}>
                            {' '}
                            Edit Book{' '}
                            </button>
                    
                </td>
                <td>
                    
                        <button className="btn btn-primary" 
                        onClick={(e: any) => this.showDetail(book, e)}>
                            {' '}
                            Details{' '}
                            </button>
                    
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
          department:{
            id:""
          }
        }
      });
    } else if (name === "department") {
      this.setState({
        bookData: {
          ...bookData,
          department: {
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
  };
 
  async showDetails(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in bookobj:', this.state.bookobj);
    await this.toggleTab(1);
  }

  async showDetail(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in bookobj:', this.state.bookobj);
    await this.toggleTab(0);
  }

  async SetObject(obj: any) {
    console.log('1. setting object :', obj);
    await this.setState({
      bookobj: obj,
    });
    console.log('2. data in obj:', obj);
  }

  onClick = (e: any) => {
    const { name, value } = e.nativeEvent.target;
    const { getBookList } = this.props;
    const { bookData, departmentId } = this.state;
    e.preventDefault();
    let bookFilterInputObject = {
      bookId: bookData.book.id,
      // departmentId: departmentId,
    };
    this.props.client
      .mutate({
        mutation: GET_BOOK_LIST,
        variables: {
          filter: bookFilterInputObject,
        },
      })
      .then((data: any) => {
      const ldt = data;
      bookData.mutateResult = [];
      bookData.mutateResult.push(ldt);
      this.setState({
        bookData: bookData
      });
      console.log('Book filter mutation result ::::: ', bookData.mutateResult);
    }).catch((error: any) => {
      console.log('there was an error sending the query result', error);
      return Promise.reject(`Could not retrieve book data: ${error}`);
    });
  }

// editBook(obj: any){
//   const { bookObj } = this.state;
//       let txtSn: any = document.querySelector("#shelfNumber");
//       let txtBt: any = document.querySelector("#bookTitle");
//       let txtAu: any = document.querySelector("#author");
//       let txtPb: any = document.querySelector("#publisher");
//       let txtEd: any = document.querySelector("#edition");
//       let txtNc: any = document.querySelector("#noOfCopies");
//       let txtIn: any = document.querySelector("#isbNo");
      
//       txtSn.value = obj.shelfNumber;
//       txtBt.value = obj.bookTitle;
//       txtAu.value = obj.author;
//       txtPb.value = obj.publisher;
//       txtEd.value = obj.edition;
//       txtNc.value = obj.noOfCopies;
//       txtIn.value = obj.isbNo;
  
//       bookObj.id = obj.id;
//       bookObj.shelfNumber = obj.shelfNumber;
//       bookObj.bookTitle = obj.bookTitle;
//       bookObj.author = obj.author;
//       bookObj.publisher = obj.publisher;
//       bookObj.edition = obj.edition;
//       bookObj.noOfCopies = obj.noOfCopies;
//       bookObj.isbNo = obj.isbNo;
  
//       this.setState({
        
//         bookObj: bookObj
//       });
// }
  


  render() {
    const { createLibraryDataCache, departmentId, bookData, activeTab, user,  } = this.state;
  
    return (
      <section className="customCss">
         <TabContent activeTab={activeTab}>
          <TabPane tabId={2}>
        <div className="container-fluid" style={{padding: '0px'}}>
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
                  {createLibraryDataCache !== null &&
                  createLibraryDataCache !== undefined &&
                  createLibraryDataCache.books !== null &&
                  createLibraryDataCache.books !== undefined
                    ? this.createBook(
                        createLibraryDataCache.books
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
              <div className="margin-bott max-width-22">
                <label htmlFor="">Book Title</label>
                <input type="text" name="search" value={bookData.search} onChange={this.onChange} />
              </div>
              <div id="srch" className="margin-bott">
                    <label htmlFor="">Search</label>
                    <input
                      type="text"
                      className="gf-form-input"
                      name="search"
                      value={bookData.search}
                      onChange={this.onChange}
                    />
                  </div>
            <div className="m-b-1 bg-heading-bg studentSearch">
              {/* <h4 className="ptl-06"></h4> */}
              <button 
              className="btn btn-primary max-width-13" 
              id="btnFind" 
              name="btnFind" 
              onClick={this.onClick} 
              style={w180}>
                  Search Books
            </button>
            </div>
            </div>
            <table id="Librarylistpage" className="striped-table fwidth bg-white">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" 
                    onClick={(e: any) => this.checkAllBooks(e)} 
                    value="checkedall" 
                    name="" 
                    id="chkCheckedAll" />
                  </th>
                  <th>Book Id</th>
                  <th>Shelf Number</th>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Edition</th>
                  <th>Publisher</th>
                  <th>ISB NUMBER</th>
                  <th>NoOfCopies</th>
                  <th>NoOfCopiesAvailable</th>
                  <th>Department</th>
                  <th>Edit</th> 
                  <th>Details</th>
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
        <TabPane tabId={0}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Book Details</h4>
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
              {this.state.bookobj !== null && 
              this.state.bookobj !== undefined && (
                <BookDetails data={this.state.bookobj} />
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
                this.state.bookobj !== null &&
                this.state.bookobj !== undefined && (
                  <EditBook
                    user={user}
                    data={this.state.bookobj}
                    bookobj={this.state.bookobj}
                    departments={this.state.createLibraryDataCache.departments}/>
                )}
            </div>
          </TabPane>
        </TabContent>
      </section>
    );
  }
}
export default withApollo(BookTable);