import gql from 'graphql-tag';

export const UPDATE_LIBRARY = gql`
  mutation updateLibrary($input: UpdateLibraryInput!) {
    updateLibrary(input: $input) {
      library {
        id
        bookTitle
        author
        bookNo
        noOfCopies
        additionalInfo
        uniqueNo
        batch {
          id
        }
        subject {
          id
          subjectDesc
        }
      }
    }
  }
`;
