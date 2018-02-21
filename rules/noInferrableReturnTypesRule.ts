import * as ts from 'typescript';
import * as Lint from 'tslint';

const FAIL_MESSAGE = `type annotation is redundant`;

interface IOptions {
}

export class Rule extends Lint.Rules.TypedRule {
    static metadata: Lint.IRuleMetadata = {
        ruleName: "no-inferrable-return-types",
        description: "Finds return type annotations that can safely be removed.",
        hasFix: true,
        optionsDescription: '',
        options: {
        },
        type: "typescript",
        requiresTypeInfo: true,
        typescriptOnly: true,
    };
    
    applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
        return this.applyWithFunction(
            sourceFile,
            walk, {},
            program.getTypeChecker(),
        );
    }
}

function walk(ctx: Lint.WalkContext<IOptions>, checker: ts.TypeChecker) {
    return ts.forEachChild(ctx.sourceFile, function cb(node): void {
        switch (node.kind) {
            // case ts.SyntaxKind.Constructor
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.GetAccessor:
            case ts.SyntaxKind.SetAccessor:
                checkFunction(node as ts.FunctionLikeDeclaration);
                break;
        }
        return ts.forEachChild(node, cb);
    });

    function checkFunction(node: ts.FunctionLikeDeclaration) {
        // exit early if there is no defined type
        if (!node.type) return;

        const { inferredReturnType, explicitReturnType } = getReturnTypes(node);

        // if ((node as any).name.text === 'funcReturnType1primitiveEqualsInferredLoosely') {
        //     console.log('x');
        // }
        const flags = ts.getCombinedModifierFlags(node);
        const isAbstract = flags & ts.ModifierFlags.Abstract;
        const isGenerator = !!node.asteriskToken;

        if (!isGenerator && !isAbstract) {
            if (explicitReturnType && inferredReturnType) {
                if (typesAreEqual(explicitReturnType, inferredReturnType)) {
                    fail(node.type);
                }
            }
        }
    }

    /**
     * Using trick on 'getReturnTypeOfSignature' - if there is no resolvedReturnType - 'getReturnTypeOfSignature' infers it.
     */
    function getReturnTypes(node: ts.FunctionLikeDeclaration) {
        let inferredReturnType;
        let explicitReturnType;

        if (node && node.type) {
            const signature = checker.getSignatureFromDeclaration(node)!;
            explicitReturnType = checker.getReturnTypeOfSignature(signature);
            
            // signature.resolvedReturnType trick, required to get infered return type
            const resolvedReturnTypeTrick = (signature as any).resolvedReturnType;
            (signature as any).resolvedReturnType = undefined;
            
            // signature.declaration.type trick, required to get infered return type
            const typeTrick = signature.declaration.type;
            signature.declaration.type = undefined;

            // get infered return type
            inferredReturnType = checker.getReturnTypeOfSignature(signature);

            // rollback tricks
            (signature as any).resolvedReturnType = resolvedReturnTypeTrick;
            signature.declaration.type = typeTrick;
        }

        return {
            inferredReturnType,
            explicitReturnType,
        }
    }

    function fail(type: ts.TypeNode) {
        ctx.addFailure(type.pos - 1, type.end, FAIL_MESSAGE, Lint.Replacement.deleteFromTo(type.pos - 1, type.end));
    }

    // TODO this could use a little more effort
    function typesAreEqual(a: ts.Type, b: ts.Type): boolean {
        return a === b || checker.typeToString(a) === checker.typeToString(b);
    }
}
