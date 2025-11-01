window.openapi = {
  "openapi": "3.0.0",
  "info": {
    "title": "TarkovTracker API (Fork)",
    "description": "Player's progress, objectives, level, reputation and more.",
    "version": "2.0",
    "contact": {
      "name": "TarkovTracker GitHub",
      "url": "https://github.com/tarkovtracker-org/TarkovTracker"
    },
    "license": {
      "name": "GNU General Public License v3.0",
      "url": "https://www.gnu.org/licenses/gpl-3.0.en.html"
    }
  },
  "servers": [
    {
      "url": "https://tarkovtracker.org/api/v2",
      "description": "TarkovTracker API v2 production endpoint"
    },
    {
      "url": "https://staging--tarkovtracker-org.web.app/api/v2",
      "description": "TarkovTracker API v2 staging preview channel"
    }
  ],
  "tags": [
    {
      "name": "Token",
      "description": "Operations related to API tokens"
    },
    {
      "name": "Progress",
      "description": "Operations related to player and team progress"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    },
    "schemas": {
      "Token": {
        "title": "Token",
        "description": "User's token data.",
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "description": "Shows token used to make this call"
          },
          "permissions": {
            "type": "array",
            "description": "GP == Get Progression, TP == Team Progression, WP == Write Progression",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "TeamProgress": {
        "title": "TeamProgress",
        "description": "Array of team member's progress data.",
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Progress"
        }
      },
      "Progress": {
        "title": "Progress",
        "description": "User's progress data.",
        "type": "object",
        "properties": {
          "playerLevel": {
            "type": "integer",
            "description": "Player's current level"
          },
          "gameEdition": {
            "type": "integer",
            "description": "1 = Standard Edition, 2 = Left Behind Edition, 3 = Prepare for Escape Edition, 4 = Edge of Darkness (Limited Edition), 5 = The Unheard Edition"
          },
          "taskProgress": {
            "type": "array",
            "description": "Array of task progress data.",
            "items": {
              "$ref": "#/components/schemas/TaskProgress"
            }
          },
          "taskObjectivesProgress": {
            "type": "array",
            "description": "Array of task objective progress data.",
            "items": {
              "$ref": "#/components/schemas/TaskObjectiveProgress"
            }
          },
          "hideoutModulesProgress": {
            "type": "array",
            "description": "Array of hideout module progress data.",
            "items": {
              "$ref": "#/components/schemas/HideoutModulesProgress"
            }
          },
          "hideoutPartsProgress": {
            "type": "array",
            "description": "Array of hideout part progress data.",
            "items": {
              "$ref": "#/components/schemas/HideoutPartsProgress"
            }
          },
          "userId": {
            "type": "string",
            "description": "Player's TarkovTracker UUID"
          },
          "displayName": {
            "type": "string",
            "description": "Player's TarkovTracker display name within their team"
          },
          "pmcFaction": {
            "type": "string",
            "description": "Player's PMC faction (USEC, BEAR)"
          }
        }
      },
      "TaskProgress": {
        "title": "TaskProgress",
        "description": "Player's progress of a given task. The key is the UUID correlating to the task ID available via the tarkov.dev API",
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "UUID correlating to the task ID available via the tarkov.dev API"
          },
          "complete": {
            "type": "boolean",
            "description": "True if a given quest has been completed."
          },
          "failed": {
            "type": "boolean",
            "description": "True if a given quest has been failed in some permanent way (eg. one of three quest options was chosen and the other two are now unavailable)"
          },
          "invalid": {
            "type": "boolean",
            "description": "True if a given quest is no longer accessible, but not necessarily failed (eg. wrong faction, part of a quest chain that was not chosen by previous completions)"
          }
        }
      },
      "HideoutModulesProgress": {
        "title": "HideoutModulesProgress",
        "description": "Player's progress on a given hideout module.",
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "UUID correlating to the hideout station level ID available via the tarkov.dev API"
          },
          "complete": {
            "type": "boolean",
            "description": "True if a given hideout module has been installed"
          }
        }
      },
      "TaskObjectiveProgress": {
        "title": "TaskObjectiveProgress",
        "description": "Player's progress on a given task objective.",
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "UUID correlating to the task objective ID available via the tarkov.dev API"
          },
          "count": {
            "type": "integer",
            "description": "Number of items collected for a given objective (if applicable)"
          },
          "complete": {
            "type": "boolean",
            "description": "True if a given objective has been completed"
          },
          "invalid": {
            "type": "boolean",
            "description": "True if a given objective is no longer accessible, but not necessarily failed (eg. wrong faction, part of a quest chain that was not chosen by previous completions)"
          }
        }
      },
      "HideoutPartsProgress": {
        "title": "HideoutPartsProgress",
        "description": "Player's progress on items needed for hideout module upgrades.",
        "type": "object",
        "properties": {
          "complete": {
            "type": "boolean",
            "description": "True if a given hideout part objective has been completed"
          },
          "count": {
            "type": "integer",
            "description": "Number of items collected for a given hideout part objective"
          },
          "id": {
            "type": "string",
            "description": "UUID correlating to individual hideout station level item requirements' ID available via the tarkov.dev API"
          }
        }
      }
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {
    "/progress": {
      "get": {
        "summary": "Returns progress data of the player",
        "tags": [
          "Progress"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "gameMode",
            "required": false,
            "description": "Game mode to get progress for (pvp or pve)",
            "schema": {
              "type": "string",
              "enum": [
                "pvp",
                "pve"
              ],
              "default": "pvp"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Player progress retrieved successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "$ref": "#/components/schemas/Progress"
                    },
                    "meta": {
                      "type": "object",
                      "properties": {
                        "self": {
                          "type": "string",
                          "description": "The user ID of the requester."
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized. Invalid token or missing 'GP' permission."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/progress/level/{levelValue}": {
      "post": {
        "summary": "Sets player's level to value specified in the path",
        "tags": [
          "Progress"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "levelValue",
            "in": "path",
            "description": "Player's new level",
            "required": true,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 79
            }
          },
          {
            "in": "query",
            "name": "gameMode",
            "required": false,
            "description": "Game mode to update level for (pvp or pve). Only used for dual-mode tokens; single-mode tokens use their configured game mode.",
            "schema": {
              "type": "string",
              "enum": [
                "pvp",
                "pve"
              ],
              "default": "pvp"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Player's level was updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "level": {
                          "type": "integer"
                        },
                        "message": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid level value provided."
          },
          "401": {
            "description": "Unauthorized. Invalid token or missing 'WP' permission."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/progress/task/{taskId}": {
      "post": {
        "summary": "Update the progress state of a single task.",
        "tags": [
          "Progress"
        ],
        "description": "Update the progress state of a single task.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "taskId",
            "required": true,
            "description": "The ID (usually UUID from tarkov.dev) of the task to update.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "gameMode",
            "required": false,
            "description": "Game mode to update task for (pvp or pve). Only used for dual-mode tokens; single-mode tokens use their configured game mode.",
            "schema": {
              "type": "string",
              "enum": [
                "pvp",
                "pve"
              ],
              "default": "pvp"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "description": "The new state for the task.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "state"
                ],
                "properties": {
                  "state": {
                    "type": "string",
                    "description": "The new state of the task.",
                    "enum": [
                      "uncompleted",
                      "completed",
                      "failed"
                    ]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "The task was updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "taskId": {
                          "type": "string"
                        },
                        "state": {
                          "type": "string"
                        },
                        "message": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid request parameters (e.g., bad taskId or state)."
          },
          "401": {
            "description": "Unauthorized to update progress (missing 'WP' permission)."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/progress/tasks": {
      "post": {
        "summary": "Updates status for multiple tasks",
        "tags": [
          "Progress"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "gameMode",
            "required": false,
            "description": "Game mode to update tasks for (pvp or pve). Only used for dual-mode tokens; single-mode tokens use their configured game mode.",
            "schema": {
              "type": "string",
              "enum": [
                "pvp",
                "pve"
              ],
              "default": "pvp"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "description": "Object where keys are task IDs and values are the new status",
                "additionalProperties": {
                  "type": "string",
                  "enum": [
                    "uncompleted",
                    "completed",
                    "failed"
                  ]
                },
                "example": {
                  "task1": "completed",
                  "task5": "uncompleted"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Tasks updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "updatedTasks": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "message": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid request body format or invalid status values."
          },
          "401": {
            "description": "Unauthorized. Invalid token or missing 'WP' permission."
          },
          "500": {
            "description": "Internal server error during batch update."
          }
        }
      }
    },
    "/progress/task/objective/{objectiveId}": {
      "post": {
        "summary": "Update objective progress for a task.",
        "tags": [
          "Progress"
        ],
        "description": "Update the progress (state or count) for a specific task objective.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "objectiveId",
            "required": true,
            "description": "The ID (usually UUID from tarkov.dev) of the task objective to update.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "gameMode",
            "required": false,
            "description": "Game mode to update objective for (pvp or pve). Only used for dual-mode tokens; single-mode tokens use their configured game mode.",
            "schema": {
              "type": "string",
              "enum": [
                "pvp",
                "pve"
              ],
              "default": "pvp"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "description": "The objective properties to update. Provide at least one.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "state": {
                    "type": "string",
                    "description": "The new state of the task objective.",
                    "enum": [
                      "completed",
                      "uncompleted"
                    ],
                    "nullable": true
                  },
                  "count": {
                    "type": "integer",
                    "description": "The number of items or completions toward the objective's goal.",
                    "minimum": 0,
                    "nullable": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "The objective was updated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "objectiveId": {
                          "type": "string"
                        },
                        "state": {
                          "type": "string",
                          "nullable": true
                        },
                        "count": {
                          "type": "integer",
                          "nullable": true
                        },
                        "message": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid request parameters (e.g., bad objectiveId, state, or count)."
          },
          "401": {
            "description": "Unauthorized to update progress (missing 'WP' permission)."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/team/progress": {
      "get": {
        "summary": "Returns progress data of all members of the team",
        "tags": [
          "Team"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "gameMode",
            "required": false,
            "description": "Game mode to get team progress for (pvp or pve). Only used for dual-mode tokens; single-mode tokens use their configured game mode.",
            "schema": {
              "type": "string",
              "enum": [
                "pvp",
                "pve"
              ],
              "default": "pvp"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Team progress retrieved successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Progress"
                      }
                    },
                    "meta": {
                      "type": "object",
                      "properties": {
                        "self": {
                          "type": "string"
                        },
                        "hiddenTeammates": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized. Invalid token or missing 'TP' permission."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/team/create": {
      "post": {
        "summary": "Creates a new team",
        "tags": [
          "Team"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "password": {
                    "type": "string",
                    "description": "Custom password for the team (optional, will be generated if not provided)"
                  },
                  "maximumMembers": {
                    "type": "integer",
                    "description": "Maximum number of team members (default: 10)",
                    "minimum": 2,
                    "maximum": 50
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Team created successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "team": {
                          "type": "string"
                        },
                        "password": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid request parameters."
          },
          "403": {
            "description": "Must wait before creating a new team after leaving."
          },
          "409": {
            "description": "User is already in a team."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/team/join": {
      "post": {
        "summary": "Join an existing team",
        "tags": [
          "Team"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "id",
                  "password"
                ],
                "properties": {
                  "id": {
                    "type": "string",
                    "description": "Team ID to join"
                  },
                  "password": {
                    "type": "string",
                    "description": "Team password"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully joined team.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "joined": {
                          "type": "boolean"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Team ID and password are required."
          },
          "401": {
            "description": "Incorrect team password."
          },
          "403": {
            "description": "Team is full."
          },
          "404": {
            "description": "Team does not exist."
          },
          "409": {
            "description": "User is already in a team."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/team/leave": {
      "post": {
        "summary": "Leave current team",
        "tags": [
          "Team"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully left team.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "left": {
                          "type": "boolean"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "User is not in a team."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    },
    "/token": {
      "get": {
        "summary": "Returns data associated with the Token given in the Authorization header of the request",
        "tags": [
          "Token"
        ],
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Token details retrieved successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean"
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "permissions": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          },
                          "description": "Permissions associated with the token."
                        },
                        "token": {
                          "type": "string",
                          "description": "The API token string."
                        },
                        "owner": {
                          "type": "string",
                          "description": "Token owner ID."
                        },
                        "note": {
                          "type": "string",
                          "description": "Token description/note."
                        },
                        "calls": {
                          "type": "integer",
                          "description": "Number of API calls made with this token."
                        },
                        "gameMode": {
                          "type": "string",
                          "description": "Token game mode (pvp, pve, or dual)."
                        }
                      }
                    },
                    "permissions": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "Permissions associated with the token."
                    },
                    "token": {
                      "type": "string",
                      "description": "The API token string."
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized. Invalid or missing token."
          },
          "500": {
            "description": "Internal server error."
          }
        }
      }
    }
  }
};