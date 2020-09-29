import * as React from 'react';
import {withRouter, RouteComponentProps, Link} from 'react-router-dom';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import '../../../css/college-settings.css';
import {withApollo} from 'react-apollo';
import AddLibraryPage from './AddIssueBookPage';
import AddBookPage from './AddBookPage';
import {CREATE_LIBRARY_FILTER_DATA_CACHE, ISSUE_BOOK_LIST, BOOK_LIST} from '../_queries';
import AddIssueBookPage from './AddIssueBookPage';
import BookListPage from './BookListPage';
import IssueBookListPage from './IssueBookListPage'

export interface LibraryProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  user?: any;
}

class Library extends React.Component<LibraryProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      activeTab: 0,
      user: this.props.user,
      createLibraryDataCache: null,
      bookList: null,
      issueBookList: null,
      branchId: null,
      academicYearId: null,
      departmentId: null,
    };
    this.toggleTab = this.toggleTab.bind(this);
    this.registerSocket = this.registerSocket.bind(this);
    this.getBookList = this.getBookList.bind(this);
    this.getIssueBookList = this.getIssueBookList.bind(this);
    this.getcreateLibraryFilterDataCache = this.getcreateLibraryFilterDataCache.bind(
      this
    );
  }

  // async componentDidMount() {
  //   console.log('Library. component did mount. User ::::', this.state.user.login);
  //   await this.registerSocket();
  //   await this.getcreateLibraryFilterDataCache();
  // }
  async componentDidMount(){
    await this.registerSocket();
    await this.getBookList();
    await this.getIssueBookList();
  }
  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
    // socket.onmessage = (response: any) => {
    //   let message = JSON.parse(response.data);
    //   console.log('Student index. message received from server ::: ', message);
    //   this.setState({
    //     branchId: message.selectedBranchId,
    //     academicYearId: message.selectedAcademicYearId,
    //     departmentId: message.selectedDepartmentId,
    //   });
    //   console.log('Library index. branchId: ', this.state.branchId);
    //   console.log('Library index. departmentId: ', this.state.departmentId);
    //   console.log('Library index. ayId: ', this.state.academicYearId);
    // };

    // socket.onopen = () => {
    //   console.log("Library index. Opening websocekt connection on index.tsx. User : ",this.state.user.login);
    //     // this.state.user
    //     socket.send(this.state.user.login);
    // }
    // window.onbeforeunload = () => {
    //   console.log('Library index. Closing websocekt connection on index.tsx');
    // };
    // const {data} = await this.props.client.query({
    //   query: CREATE_LIBRARY_FILTER_DATA_CACHE,
    //   variables: {
    //   },

    //   fetchPolicy: 'no-cache',
    // });
    // this.setState({
    //   createLibraryDataCache: data,
    // });
  }

  async getcreateLibraryFilterDataCache() {
  // const {} = this.state;
    // console.log('Library branch Id:', branchId);
    const {data} = await this.props.client.query({
      query: CREATE_LIBRARY_FILTER_DATA_CACHE,
      variables: {
        // collegeId: '' + branchId,
        // departmentId: departmentId,
        // academicYearId: '' + academicYearId,
        // collegeId: collegeId,
      },

      fetchPolicy: 'no-cache',
    });
    this.setState({
      createLibraryDataCache: data,
    });
  }

  async getBookList(){
    const { data } = await this.props.client.query({
        query: BOOK_LIST,
         fetchPolicy: 'no-cache'
    })
    this.setState({
        bookList: data.getBookList
    });
    console.log("getBookList() : ", this.state.bookList);
}

  async getIssueBookList(){
  const { data } = await this.props.client.query({
      query: ISSUE_BOOK_LIST,
       fetchPolicy: 'no-cache'
  })
  this.setState({
      issueBookList: data.getIssueBookList
  });
  console.log("getIssueBookList() : ", this.state.issueBookList);
}


  toggleTab(tabNo: any) {
    this.setState({
      activeTab: tabNo,
    });
    if (tabNo === 0) {
      this.getcreateLibraryFilterDataCache();
    }
    if(tabNo===1){
      this.getcreateLibraryFilterDataCache();
      this.getIssueBookList();
  }
  if(tabNo===2){
    this.getcreateLibraryFilterDataCache();
  }
  if(tabNo===3){
    this.getcreateLibraryFilterDataCache();
  }
  // if(tabNo===4){
  //   this.getcreateLibraryFilterDataCache();
  // }
}

  render() {
    const {activeTab, user, createLibraryDataCache,issueBookList,bookList} = this.state;
    return (
      <section className="tab-container row vertical-tab-container">
        <Nav tabs className="pl-3 pl-3 mb-4 mt-4 col-sm-2">
          <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 0 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(0);
              }}
            >
             Add Book page
            </NavLink>
          </NavItem>
          <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 1 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(1);
              }}
            >
             Add Issue Book Page
            </NavLink>
          </NavItem>
          <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 2 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(2);
              }}
            >
             {/* Update Issue Book Page */}
             Book List Page
            </NavLink>
          </NavItem>
          <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 3 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(3);
              }}
            >
              IssueBook List Page
            </NavLink>
          </NavItem>
          {/* <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 4 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(4);
              }}
            >
              Book List Page
            </NavLink>
          </NavItem> */}
        </Nav>
        <TabContent activeTab={activeTab} className="col-sm-10 border-left p-t-1">
        <TabPane tabId={0}>
        {
           user !== null && createLibraryDataCache && (
            <AddBookPage user={user} createLibraryDataCache={createLibraryDataCache.createLibraryDataCache}/>
            //   :
            // null
           )
        }
        </TabPane>
          <TabPane tabId={1}>
          {/* <AddBookPage/> */}
          {
           user !== null && createLibraryDataCache !== null &&  bookList !== null && issueBookList !== null?
            <AddIssueBookPage user={user} createLibraryDataCache={createLibraryDataCache.createLibraryDataCache} bookList={bookList} issueBookList={issueBookList}/>
              :
            null
        }
          </TabPane>
          <TabPane tabId={2}>
          {
           user !== null && createLibraryDataCache  &&  bookList !== null &&(
            <BookListPage user={user} createLibraryDataCache={createLibraryDataCache.createLibraryDataCache} bookList={bookList} />
              // :
            // null
           )
        }
          </TabPane> 
          { <TabPane tabId={3}>
          {
           user !== null && createLibraryDataCache !== null  &&  issueBookList !== null?
            <IssueBookListPage user={user} createLibraryDataCache={createLibraryDataCache.createLibraryDataCache} issueBookList={issueBookList} />
              :
            null
        }
          </TabPane> }
          {/* <TabPane tabId={4}>
          {
           user !== null && createLibraryFilterDataCache !== null?
            <BookListPage user={user} createLibraryFilterDataCache={createLibraryFilterDataCache.createLibraryDataCache}/>
              :
            null
        }
          </TabPane> */}
        </TabContent>
      </section>
    );
  }
}

export default withApollo(Library);
