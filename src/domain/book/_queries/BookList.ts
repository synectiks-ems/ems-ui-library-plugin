import gql from 'graphql-tag';

export const BOOK_LIST = gql`
  query {
    getBookList {
      id
      shelfNo
      bookTitle
      author
      edition
      publisher
      author
      noOfCopies
      departmentId
      department {
        id
        name
        description
      }
    }
  }
`;
