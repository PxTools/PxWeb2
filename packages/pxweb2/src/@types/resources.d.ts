interface Resources {
  translation: {
    common: {
      alert: {
        error: 'Error:';
        info: 'Information:';
        success: 'Success:';
        warning: 'Warning:';
      };
      footer: {
        about: {
          description: 'Description text...';
          title: 'About';
        };
        accessibility: {
          description: 'Description text...';
          title: 'Accessibility';
        };
        contact: {
          description: 'Description text...';
          title: 'Contact';
        };
        language_header: 'Language';
        version: {
          description: 'Description text...';
          title: 'Version';
        };
      };
      generic_buttons: {
        cancel: 'Cancel';
        close: 'Close';
        ok: 'OK';
        save: 'Save';
        search: 'Search';
      };
      generic_tags: {
        mandatory: 'Mandatory';
      };
      header: {
        language_selector: 'Språk/Language';
        logo: 'PxWeb 2.0';
        logo_alt: 'To the front page';
      };
      not_found: {
        page_not_found: {
          description: 'The page you are looking for does not exist. Please check the URL or return to the homepage.';
          title: 'Page not found';
        };
        unsupported_language: {
          description: 'The selected language is not supported.';
          title: 'Unsupported language';
        };
      };
      skip_to_main: 'Skip to main content';
      status_messages: {
        drawer_edit: 'More tools for editing the table are under construction.';
        drawer_help: 'No content will be added here. The help button must be set up to link directly to your own help pages.';
        drawer_save_api: 'Feature for API query is under construction.';
        drawer_save_file: 'More file formats are in the works.';
        drawer_view: 'Graph display is under construction.';
        tab_definitions: 'The content of this tab is under construction.';
        welcome: "Welcome to the new PxWeb 2.0! We're still improving to help you find and use the numbers you need 📊✨";
      };
      title: 'PxWeb 2.0';
    };
    date: {
      simple_date: '{{value, datetime}}';
      simple_date_with_time: "{{value, datetime(year: 'numeric'; month: 'numeric'; day: 'numeric'; hour: 'numeric'; minute: 'numeric')}}";
    };
    meta: {
      languageName: 'English';
      shorthand: 'en';
    };
    number: {
      simple_number: '{{value, pxNumber}}';
      simple_number_with_default_formatter: "{{value, number(minimumFractionDigits: 5; maximumFractionDigits: 5; roundingMode: 'halfExpand')}}";
      simple_number_with_five_decimals: '{{value, pxNumber(minimumFractionDigits: 5; maximumFractionDigits: 5;)}}';
      simple_number_with_four_decimals: '{{value, pxNumber(minimumFractionDigits: 4; maximumFractionDigits: 4;)}}';
      simple_number_with_one_decimal: '{{value, pxNumber(minimumFractionDigits: 1; maximumFractionDigits: 1;)}}';
      simple_number_with_six_decimals: '{{value, pxNumber(minimumFractionDigits: 6; maximumFractionDigits: 6;)}}';
      simple_number_with_three_decimals: '{{value, pxNumber(minimumFractionDigits: 3; maximumFractionDigits: 3;)}}';
      simple_number_with_two_decimals: '{{value, pxNumber(minimumFractionDigits: 2; maximumFractionDigits: 2;)}}';
      simple_number_with_zero_decimal: '{{value, pxNumber(minimumFractionDigits: 0; maximumFractionDigits: 0;)}}';
    };
    presentation_page: {
      footer: {
        contact: 'Contact';
        copyright: 'Copyright © 2024 Statistics Sweden and Statistics Norway';
        description: 'On this site you can follow as Statistics Sweden (SCB) and Statistics Norway (SSB) are building a new and more user-friendly interface for PxWeb.';
        descriptionLink: 'Read more about the project on Github';
        projectLeader: 'Project leader';
        scrumMaster: 'Scrum master';
      };
      main_content: {
        about_table: {
          contact: {
            description: 'Description text...';
            missing_heading: 'No contact information';
            missing_text: 'The table has no contact information.';
            title: 'Contact';
          };
          definitions: {
            description: 'The table is part of the statistics {{statistics}}';
            title: 'Definitions';
          };
          details: {
            base_time: 'Base time';
            boolean_false: 'No';
            boolean_true: 'Yes';
            copyright: 'Copyright';
            description: 'Description text...';
            last_updated: 'Last updated';
            link: 'Link';
            matrix: 'Matrix';
            next_update: 'Next update';
            official_statistics: 'Official statistics';
            reference_time: 'Reference time';
            source: 'Source';
            survey: 'Survey';
            title: 'Details';
            unit: 'Unit';
            update_frequency: 'Update frequency';
          };
          footnotes: {
            important_about_selection_body: 'Click on this message to read the notes.';
            important_about_selection_body_one_note: 'Click on this message to read the note.';
            important_about_selection_heading_1: 'There are ';
            important_about_selection_heading_2: ' important notes for your selection';
            important_about_selection_heading_one_note_1: 'There is ';
            important_about_selection_heading_one_note_2: ' important note for your selection';
            mandatory_heading: 'Important about the table';
            mandatory_variable_heading: 'Important about';
            missing_heading: 'No notes';
            missing_text_selection: 'There are no notes for the selected filtering.';
            missing_text_table: 'The table has no notes.';
            non_mandatory_heading: 'For the entire table';
            show_all_footnotes: 'Show all notes for table';
            symbol_explanation_heading: 'Symbol explanation';
            title: 'Notes';
          };
          title: 'Information';
        };
        arialabelbreadcrumb: 'Breadcrumb';
        dynamic_table_title: '{{table_content_type}} by {{table_content_label_first_part}} and {{table_content_label_last_part}}';
        last_updated: 'Last updated';
        related: {
          description: 'Description text...';
          title: 'Related';
        };
        show_details: 'Show details';
        table: {
          warnings: {
            missing_mandatory: {
              description: 'You must select something in the filter';
              title: 'The table cannot be displayed';
            };
            to_many_values_selected: {
              description1: 'Your current selection makes ';
              description2: ' cells, while the table can display a maximum of ';
              description3: ' cells. Reduce the number of selections in the filter, and once this message disappears, the table will update as usual.';
              maxCells: '{{maxCells}}';
              selectedCells: '{{selectedCells}}';
              title: 'The table is too large and cannot be updated';
            };
          };
        };
      };
      sidemenu: {
        arialabeltoolsidemenu: 'Tool menu for table';
        edit: {
          calculate: {
            sum: {
              description: 'Description text...';
              title: 'Sum';
            };
            title: 'Calculate';
          };
          customize: {
            change_order: {
              description: 'Description text...';
              title: 'Change order';
            };
            pivot: {
              aria_label: 'Rotate table clockwise';
              screen_reader_announcement: 'Table rotated after {{first_variables}} and {{last_variable}}';
              title: 'Rotate table';
            };
            rearrange: {
              description: 'Description text...';
              title: 'Rearrange table';
            };
            title: 'Customize';
          };
          hide_display: {
            title: 'Hide/display';
          };
          title: 'Edit';
        };
        help: {
          title: 'Help';
        };
        hide: 'Hide';
        save: {
          api: {
            description: 'Description text...';
            query: 'API query';
            title: 'API';
          };
          file: {
            formats: {
              csv: 'Semicolon-delimited with heading (.csv)';
              excel: 'Excel (.xlsx)';
              html: 'HTML (.html)';
              jsonstat2: 'JSON-stat2 (.json)';
              parquet: 'Parquet (.parquet)';
              px: 'PC-Axis (.px)';
            };
            loading_announcement: 'File is still being processed. Please wait.';
            title: 'Download as file';
          };
          imagefile: {
            png: 'Chart (png)';
            title: 'Save as graph';
          };
          link: {
            description: 'Description text...';
            title: 'Save as link';
          };
          savequery: {
            copiedButton: 'Link copied';
            copyButton: 'Copy link';
            copyStatus: 'Link copied to clipboard';
            createButton: 'Get link';
            createStatus: 'Link generated. Click again to copy the link';
            info: 'You get a unique link to your table, that we keep updated for you. How new time periods are added is up to you.';
            loadingStatus: 'Generating link';
            periodOptions: {
              from: "Add new ones (they will be added to the ones you've selected now)";
              selected: "Don't add new ones (the table will only show the ones you've selected now)";
              top: 'Add new ones, but keep the same number (when a new time period is added, the oldest one is removed)';
            };
            radioLegend: 'Options for new time periods';
            title: 'Link to updated table';
          };
          title: 'Save';
        };
        selection: {
          title: 'Filter';
          variablebox: {
            content: {
              mixed_checkbox: 'Select all';
              select: {
                label: 'Select grouping';
                modal: {
                  cancel_button: 'Cancel';
                  confirm_button: 'Save';
                };
                placeholder: 'Nothing selected';
              };
              values_list: {
                aria_label: 'List of {{total}} values.';
                no_results_bodyshort: 'Try a different keyword or spelling.';
                no_results_heading: 'No results for “{{search}}”';
              };
            };
            header: {
              alert_no_mandatory_values: 'You must select something in the list for the table to be displayed';
              tag_mandatory: 'Mandatory';
              tag_selected: '{{selected}} of {{total}} selected';
            };
            search: {
              arialabelicontext: 'Search icon';
              ariallabelclearbuttontext: 'Clear search icon';
              label: 'Search';
              placeholder: 'Search in list';
            };
          };
        };
        view: {
          graph: {
            title: 'Graph';
          };
          table: {
            title: 'Table';
          };
          title: 'Display';
        };
      };
    };
    start_page: {
      filter: {
        back: 'Back';
        button: 'Filter';
        close: 'Close filter';
        frequency: {
          annual: 'Year';
          monthly: 'Month';
          other: 'Other';
          quarterly: 'Quarter';
          term: 'Term';
          weekly: 'Week';
        };
        header: 'Filter';
        remove_all_filter: 'Remove all filters';
        remove_filter_aria: 'Remove filter, {{value}}';
        show_results: 'Show {{value}} results';
        subject: 'Topic';
        timeUnit: 'Time period';
        variabel: 'Variable';
        variabel_search: 'Search for variable';
        year: {
          clear_selection: 'Clear selection';
          from_label: 'From';
          from_year: 'From year';
          title: 'Year';
          to_label: 'To';
          to_year: 'To year';
        };
      };
      header: 'Welcome to PxWeb 2.0';
      ingress: "Looking for the perfect table? Use the search field and filters to dig into the numbers you need. Whether you're hunting for trends, facts, or just an oddly satisfying dataset, PxWeb 2.0 has your back.";
      more_about_label: 'More about PxWeb 2.0';
      more_about_text: 'More about Text EN';
      search_label: 'Search in PxWeb 2.0';
      search_placeholder: 'Search for table names or variables';
      table: {
        loading: 'Loading...';
        number_of_tables: '<strong>{{count}}</strong> tables';
        number_of_tables_found: '<strong>{{count}}</strong> tables found';
        show_less: 'Show less';
        show_more: 'Show more';
        show_number_of_tables: 'Showing {{countShown}} of {{countTotal}}';
        show_number_of_tables_aria: '{{count}} tables found, showing {{countShown}} of {{countTotal}}';
        updated_label: 'Updated';
      };
    };
  };
}

export default Resources;
