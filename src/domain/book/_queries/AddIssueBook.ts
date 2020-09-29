import gql from 'graphql-tag';

export const ADD_ISSUE_BOOK = gql`
  mutation addIssueBook($input: AddIssueBookInput) {
    addIssueBook(input: $input) {
      cmsIssueBookVo {
        exitCode
        exitDescription
        dataList {
          id
          issueDate
          dueDate
          bookStatus
          receivedDate
          strIssueDate
          strDueDate
          strReceivedDate
          batchId
          departmentId
          bookId
          studentId
          branchId
          student {
            id
            studentName
            rollNo
          }
          book {
            id
            bookTitle
            noOfCopies
            noOfCopiesAvailable
          }
          department {
            id
            name
            deptHead
            branch {
              id
            }
          }
          batch {
            id
            batch
            department {
              id
            }
          }
        }
      }
    }
  }
`;
