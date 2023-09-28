export const checkSchema = (schemaStructure, schemaObject) => {
    try {
        schemaStructure.parse(schemaObject)
    } catch (error) {
        let messages = {}
        const errors = JSON.parse(error)
        errors.map((error) => {
            messages[error.path[0]] = error.message
        })
        return messages
    }
}

export const zodString = (field) => {
    return {
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
    }
}

export const zodNumber = (field) => {
    return {
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a number`,
    }
}

export const zodBoolean = (field) => {
    return {
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a boolean`,
    }
}