interface Resources {
  "translation": {
    "common": {
      "title": "Welcome to PxWeb 2.0",
      "header": {
        "title": "PxWeb 2.0",
        "logo": "PxWeb 2.0"
      },
      "footer": {
        "contact": {
          "title": "Contact",
          "description": "Description text..."
        },
        "about": {
          "title": "About",
          "description": "Description text..."
        },
        "accessibility": {
          "title": "Accessibility",
          "description": "Description text..."
        },
        "version": {
          "title": "Version",
          "description": "Description text..."
        }
      },
      "generic_buttons": {
        "ok": "OK",
        "cancel": "Cancel"
      }
    },
    "start_page": {
      "header": "Welcome to the app!",
      "welcome_trans_test": "Welcome to the <1>app</1> for PxWeb 2.0!"
    },
    "presentation_page": {
      "sidemenu": {
        "hide": "Hide menu",
        "selection": {
          "title": "Filter"
        },
        "view": {
          "title": "View",
          "table": {
            "title": "Table"
          },
          "graph": {
            "title": "Graph"
          }
        },
        "edit": {
          "title": "Edit",
          "customize": {
            "title": "Customize",
            "pivot": {
              "title": "Pivot"
            },
            "rearrange": {
              "title": "Rearrange table",
              "description": "Description text..."
            },
            "change_order": {
              "title": "Change order",
              "description": "Description text..."
            }
          },
          "calculate": {
            "title": "Calculate",
            "sum": {
              "title": "Sum",
              "description": "Description text..."
            }
          },
          "hide_display": {
            "title": "Hide/display"
          }
        },
        "save": {
          "title": "Save",
          "file": {
            "title": "Save as file",
            "excel": "Excel (xlsx)"
          },
          "imagefile": {
            "title": "Save as graph",
            "png": "Chart (png)"
          },
          "link": {
            "title": "Save as link",
            "description": "Description text..."
          },
          "api": {
            "title": "API",
            "description": "Description text..."
          }
        },
        "help": {
          "title": "Help"
        }
      },
      "main_content": {
        "last_updated": "Last updated",
        "show_details": "Show details",
        "about_table": {
          "title": "About the table",
          "footnotes": {
            "title": "Notes",
            "show_all_footnotes": "Show all notes for table"
          },
          "information": {
            "title": "Information",
            "description": "The table is part of the statistics {{statistics}}"
          },
          "definition": {
            "title": "Definitions",
            "description": "Description text..."
          },
          "metadata": {
            "title": "Metadata",
            "description": "Description text..."
          }
        },
        "related": {
          "title": "Related",
          "description": "Description text..."
        }
      }
    },
    "date": {
      "simple_date": "{{value, datetime}}",
      "simple_date_with_time": "{{value, datetime(year: 'numeric'; month: 'numeric'; day: 'numeric'; hour: 'numeric'; minute: 'numeric')}}"
    },
    "number": {
      "simple_number": "{{value, pxNumber}}",
      "simple_number_with_zero_decimal": "{{value, pxNumber(minimumFractionDigits: 0; maximumFractionDigits: 0;)}}",
      "simple_number_with_one_decimal": "{{value, pxNumber(minimumFractionDigits: 1; maximumFractionDigits: 1;)}}",
      "simple_number_with_two_decimals": "{{value, pxNumber(minimumFractionDigits: 2; maximumFractionDigits: 2;)}}",
      "simple_number_with_three_decimals": "{{value, pxNumber(minimumFractionDigits: 3; maximumFractionDigits: 3;)}}",
      "simple_number_with_four_decimals": "{{value, pxNumber(minimumFractionDigits: 4; maximumFractionDigits: 4;)}}",
      "simple_number_with_five_decimals": "{{value, pxNumber(minimumFractionDigits: 5; maximumFractionDigits: 5;)}}",
      "simple_number_with_default_formatter": "{{value, number(minimumFractionDigits: 5; maximumFractionDigits: 5; roundingMode: 'halfExpand')}}"
    }
  }
}

export default Resources;
