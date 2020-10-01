import * as React from 'react';
import {withApollo} from 'react-apollo';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

type IssueBookTableStates = {
    user: any;
    activeTab: any;
    issueBookObj: any;
    issueBookData:any;
  };

export interface IssueBookDetailsProps extends React.HTMLAttributes<HTMLElement> {
    [data: string]: any;
    user?: any;
  }
  class IssueBookDetailsPage<T = {[data: string]: any}> extends React.Component<IssueBookDetailsProps,IssueBookTableStates> {
  constructor(props: any) {
    super(props);
    this.state = {
     activeTab: 0,
     issueBookObj: this.props.data,
     user: this.props.user,
     issueBookData: {
     },
    };
    this.toggleTab = this.toggleTab.bind(this);
  }
  
  async componentDidMount() {
    this.setState({
      issueBookObj: this.props.data,
    });
  }

  componentWillReceiveProps() {
    this.setState({
        issueBookObj: this.props.data,
    });
  }
  ;
  toggleTab(tabNo: any) {
    this.setState({
      activeTab: tabNo,
    });
  }

 render() {
    const {activeTab,issueBookData, issueBookObj} = this.state;
    console.log('Check the new obj in another page:', issueBookObj);
    return (    
      <TabContent activeTab={activeTab} className="ltab-contianer p-1">
        <div className="row">
          {/* <div className="col-sm-2 col-xs-4 m-b-1 adminDetails">
            <span className="profile-label w-8">
               Department:
            </span>
            {issueBookObj.department !== undefined && (
            <span>{issueBookObj.department.name}</span>
            )}
           </div> */}
          
          </div>
          <h4> <span className="profile-label">Book Title:</span>
            {issueBookObj.book !== undefined && (
            <span>{issueBookObj.book.bookTitle}</span>)}</h4>
          <table id="libraryTable" className="striped-table fwidth bg-white p-3 m-t-1">
            <thead>
             <tr>
                 <th>Issued Date</th>
                  <th>Due Date</th>
                  <th>Received Date</th>
                  <th>Book Status</th>
                  <th>Batch</th>
                  <th>Student</th>
                  <th>Book</th>
                  <th>Department</th>
             </tr>
            </thead>
              <td>{issueBookObj.strIssueDate}</td>
              <td>{issueBookObj.strDueDate}</td>
              <td>{issueBookObj.strReceivedDate}</td>
              <td>{issueBookObj.bookStatus}</td>
              <td>
               {issueBookObj.batch !== undefined && (
               <span>{issueBookObj.batch.batch}</span>
                )}
               </td>
              <td>
              {issueBookObj.student !== undefined && (
              <span>{issueBookObj.student.studentName}</span>
              )}
               </td>
               <td>
              {issueBookObj.book !== undefined && (
             <span>{issueBookObj.book.bookTitle}</span>
              )}
              </td>
              <td>
              {issueBookObj.department !== undefined && (
             <span>{issueBookObj.department.name}</span>
              )}
              </td>
                    
            </table>
       </TabContent> 
    );
    }
  }
  export default withApollo(IssueBookDetailsPage);