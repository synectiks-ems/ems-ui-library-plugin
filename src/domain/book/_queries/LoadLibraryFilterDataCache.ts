import gql from 'graphql-tag';

export const CREATE_LIBRARY_FILTER_DATA_CACHE = gql`
  query createLibraryFilterDataCache($collegeId: String!, $academicYearId: String!) {
    createLibraryFilterDataCache(collegeId: $collegeId, academicYearId: $academicYearId) {
      branches {
        id
        branchName
      }
      departments {
        id
        name
        branch {
          id
        }
        academicyear {
          id
        }
      }
      batches {
        id
        batch
        department {
          id
        }
      }
      sections {
        id
        section
        batch {
          id
        }
      }
      subjects {
        id
        subjectType
        subjectCode
        subjectDesc
        department {
          id
        }
        batch {
          id
        }
      }
      semesters {
        id
        description
      }
      libraries {
        id
        bookTitle
        author
        bookNo
        noOfCopies
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
      students {
        id
        batch {
          id
          batch
        }
        department {
          id
          description
        }
        studentName
        section {
          id
          section
        }
      }
      books {
        id
        status
        strDueDate
        strIssueDate
        strRecDate
        student {
          id
          studentName
        }
        library {
          id
        }
      }
    }
  }
`;
