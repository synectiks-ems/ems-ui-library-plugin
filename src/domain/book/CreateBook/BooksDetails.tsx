import * as React from 'react';
import {withApollo} from 'react-apollo';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

type BookTableStates = {
    user: any;
    activeTab: any;
    bookObj: any;
    bookData:any;
  };

export interface BookDetailsProps extends React.HTMLAttributes<HTMLElement> {
    [data: string]: any;
    user?: any;
  }
  class BookDetailsPage<T = {[data: string]: any}> extends React.Component<BookDetailsProps,BookTableStates> {
  constructor(props: any) {
    super(props);
    this.state = {
     activeTab: 0,
     bookObj: this.props.data,
     user: this.props.user,
     bookData: {
     },
    };
    this.toggleTab = this.toggleTab.bind(this);
  }
  
  async componentDidMount() {
    this.setState({
      bookObj: this.props.data,
    });
  }

  componentWillReceiveProps() {
    this.setState({
      bookObj: this.props.data,
    });
  }
  ;
  toggleTab(tabNo: any) {
    this.setState({
      activeTab: tabNo,
    });
  }

 render() {
    const {activeTab,bookData, bookObj} = this.state;
    console.log('Check the new obj in another page:', bookObj);
    return (    
      <TabContent activeTab={activeTab} className="ltab-contianer p-1">
        <div className="row">
          {/* <div className="col-sm-2 col-xs-4 m-b-1 adminDetails">
            <span className="profile-label w-8">
               Department:
            </span>
            {bookObj.department !== undefined && (
            <span>{bookObj.department.name}</span>
            )}
           </div> */}
           {/* <div className="col-sm-3 col-xs-6 m-b-4 adminDetails">
             <span className="profile-label w-15">
                Semester:
              </span>
              <span className="">{bookObj.semester}</span>
            </div>
            <div className="col-sm-7 col-xs-5 m-b-1 adminDetails">
              <span className="profile-label w-20">
                Section: </span>
                {bookObj.section !== undefined && (
              <span>{bookObj.section.section}</span>
              )}
            </div> */}
          </div>
          <div className="col-sm-4 col-xs-12 m-b-2">
                      <span className="profile-label">Book Title: </span>
                      <span>{bookObj.bookTitle}</span>
             </div>
          <table id="libraryTable" className="striped-table fwidth bg-white p-3 m-t-1">
            <thead>
             <tr>
             <th>Shelf Number</th>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Edition</th>
                  <th>Publisher</th>
                  <th>ISB NUMBER</th>
                  <th>NoOfCopies</th>
                  <th>No Of Copies Available</th>
                  <th>Department</th>
             </tr>
            </thead>
              <td>{bookObj.shelfNo}</td>
              <td>{bookObj.bookTitle}</td>
              <td>{bookObj.author}</td>
              <td>{bookObj.edition}</td>
              <td>{bookObj.publisher}</td>
              <td>{bookObj.isbNo}</td>
              <td>{bookObj.noOfCopies}</td>
              <td>{bookObj.noOfCopiesAvailable}</td>
              <td> {bookObj.department !== undefined && (
            <span>{bookObj.department.name}</span>
            )}</td>
            </table>
       </TabContent> 
    );
    }
  }
  export default withApollo(BookDetailsPage);