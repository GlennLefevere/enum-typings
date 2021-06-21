import * as ts from "typescript";
import * as fs from "fs";

const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    let parent: ts.Node;
    const visitor = (node: ts.Node): ts.Node | ts.Node[] => {
      if (ts.SyntaxKind.DeclareKeyword === node.kind && isEnumDeclaration(parent, sourceFile)) {
        if(!!context.factory) {
          return [node, context.factory.createToken(ts.SyntaxKind.ConstKeyword)];
        } else if(!!ts.createToken) {
          return [node, ts.createToken(ts.SyntaxKind.ConstKeyword)];
        }
      }

      if(!!node.getChildren(sourceFile)?.length) {
        parent = node;
      }
      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};

export default transformer;

export function enumTypings(): void {
  const files = getFiles().filter(f => f.endsWith('d.ts'));
  let program = ts.createProgram(files, {});
  let printer = ts.createPrinter()

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
      const result = ts.transform(sourceFile, [transformer]);
      const transformedSourceFile: ts.SourceFile = result.transformed[0] as ts.SourceFile;
      fs.writeFileSync(sourceFile.fileName, printer.printFile(transformedSourceFile));
    }
  }
}

function getFiles(path = './') {
  const entries = fs.readdirSync(path, {withFileTypes: true});

  const files = entries.filter(e => e.isFile()).map(e => `${path}${e.name}`);

  const folders = entries.filter(e => e.isDirectory()).filter(f => f.name !== 'node_modules');

  folders.forEach(f => files.push(...getFiles(`${path}${f.name}/`)));
  return files;
}

function isEnumDeclaration(node: ts.Node, sourceFile: ts.SourceFile): boolean {
  const children = node.getChildren(sourceFile);
  const declaration = children.find(n => n.kind === ts.SyntaxKind.SyntaxList && !!n?.getChildren(sourceFile).find(d => d.kind === ts.SyntaxKind.DeclareKeyword));
  const enumKeyword = children.find(n => n.kind === ts.SyntaxKind.EnumKeyword);
  return !!declaration && !!enumKeyword;
}

module.exports = enumTypings;
