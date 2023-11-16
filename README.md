# Effect CLI

command-line interface (CLI)

## Commands

A command is a structured sequence of text tokens that represents a specific directive for a CLI application. Effect CLI represents a CLI command using the `Command<A>` data type. The generic data type `A` is used to 

that can be entered by a user into the command-line interface and results in a specific directive being carried out by the command-line interface application.




The parsing of these tokens by Once the `Command` is parsed by the CLI application, the corresponds to a particular `CommandDirective`.

 which are parsed by the CLI application and  of text which instructs the CLI application to perform a specific directive. Every command-line application will have at least one command


Command directives can be either built-in directives or user-defined directives

## Options

## Args
