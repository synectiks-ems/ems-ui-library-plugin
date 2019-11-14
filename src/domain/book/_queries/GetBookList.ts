import gql from 'graphql-tag';

export const GET_BOOK_LIST = gql`
  mutation getBookList($filter: LibraryListFilterInput!) {
    getBookList(filter: $filter) {
      id
      bookTitle
      author
      noOfCopies
      bookNo
      additionalInfo
      uniqueNo
      batch {
        id
        batch
      }
      subject {
        id
        subjectDesc
      }
    }
  }
`;
